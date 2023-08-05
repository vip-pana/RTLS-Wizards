// Necessary modules
#include <dw3000.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>

// App name to run UWB initial test
#define APP_NAME "Booting UWB Anchor..."

// Connection pins
const uint8_t PIN_RST = 27;  // reset pin
const uint8_t PIN_IRQ = 34;  // irq pin
const uint8_t PIN_SS = 4;    // spi select pin

// Default communication configuration (we use default non-STS DW mode)
static dwt_config_t config = {
  5,                 // Channel number
  DWT_PLEN_128,      // Preamble length (used in TX only)
  DWT_PAC8,          // Preamble acquisition chunk size (used in RX only)
  9,                 // TX preamble code. (used in TX only)
  9,                 // RX preamble code (used in RX only)
  1,                 // Non-standard 8 symbol SFD
  DWT_BR_6M8,        // Data rate
  DWT_PHRMODE_STD,   // PHY header mode
  DWT_PHRRATE_STD,   // PHY header rate
  (129 + 8 - 8),     // SFD timeout (used in RX only)
  DWT_STS_MODE_OFF,  // STS disabled
  DWT_STS_LEN_64,    // STS length
  DWT_PDOA_M0        // PDOA mode off
};

// Default antenna delay values for 64 MHz PRF
#define TX_ANT_DLY 16385
#define RX_ANT_DLY 16385

// Frames used in the ranging process
static uint8_t rx_poll_msg[] = { 0x41, 0x88, 0, 0xCA, 0xDE, 'W', 'A', 'V', 'E', 0xE0, 0, 0 };
static uint8_t tx_resp_msg[] = { 0x00, 0x88, 0, 0xCA, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };

// Length of the common part of the message
#define ALL_MSG_COMMON_LEN 10

// Indexes to access some of the fields in the frames defined above
#define ALL_MSG_SN_IDX 2
#define RESP_MSG_POLL_RX_TS_IDX 10
#define RESP_MSG_RESP_TX_TS_IDX 14

// Frame sequence number, incremented after each transmission
static uint8_t frame_seq_nb = 0;

// Buffer to store received response message (must be less than FRAME_LEN_MAX_EX)
static uint8_t rx_buffer[12];

// Hold copy of status register
static uint32_t status_reg = 0;

// Delay between frames (in UWB microseconds)
#define POLL_RX_TO_RESP_TX_DLY_UUS 450

// Hold copies of computed time of flight and distance
static uint64_t poll_rx_ts;
static uint64_t resp_tx_ts;

/* Values for the PG_DELAY and TX_POWER registers reflect the bandwidth and power of the spectrum at the current
   temperature. These values can be calibrated prior to taking reference measurements. */
extern dwt_txconfig_t txconfig_options;

// Run setup
void setup() {

  // Baud setting && module startup
  Serial.begin(115200);
  test_run_info((unsigned char*)APP_NAME);

  // Reset DW IC
  spiBegin(PIN_IRQ, PIN_RST);

  // Configure SPI rate (DW3000 supports up to 38 MHz)
  spiSelect(PIN_SS);

  // Need to make sure DW IC is in IDLE_RC before proceeding
  if (!dwt_checkidlerc()) {
    UART_puts("IDLE FAILED\r\n");
    while (1)
      ;
  }

  // Catching init error
  if (dwt_initialise(DWT_DW_INIT) == DWT_ERROR) {
    UART_puts("INIT FAILED\r\n");
    while (1)
      ;
  }

  // Enabling LEDs here for debug so that for each TX the D1 LED will flash on DW3000 red eval-shield boards.
  dwt_setleds(DWT_LEDS_ENABLE | DWT_LEDS_INIT_BLINK);

  // Configure DW IC (if the dwt_configure returns DWT_ERROR either the PLL or RX calibration has failed the host should reset the device)
  if (dwt_configure(&config)) {
    UART_puts("CONFIG FAILED\r\n");
    while (1)
      ;
  }

  // Configure the TX spectrum parameters (power, PG delay and PG count)
  dwt_configuretxrf(&txconfig_options);

  // Apply default antenna delay value
  dwt_setrxantennadelay(RX_ANT_DLY);
  dwt_settxantennadelay(TX_ANT_DLY);

  /* Next can enable TX/RX states output on GPIOs 5 and 6 to help debug, and also TX/RX LEDs
     Note, in real low power applications the LEDs should not be used. */
  dwt_setlnapamode(DWT_LNA_ENABLE | DWT_PA_ENABLE);

  String macAnchor = WiFi.macAddress();
  String macRequest = macAnchor.substring(9);
  ;
  macRequest.replace(":", "");

  // Create WiFiManager object
  WiFiManager wfm;

  // Supress Debug information
  wfm.setDebugOutput(false);

  // Remove any previous network settings
  wfm.resetSettings();

  // Attempt Wi-Fi connection
  wfm.autoConnect(macRequest.c_str(), "dw3000esp32");

  // Setting message to send partial MAC address
  uint8_t message[18];
  macAnchor.getBytes(message, 18);
  int counter = 4;
  // start to send by the nineth element of the mac address
  // if there is ':' in the mac address ignore that
  for (int i = 9; i < sizeof(message); i++) {
    if (macAnchor[i] != 58) {
      tx_resp_msg[counter] = message[i];
      counter += 1;
    }
  }
  // POST request for save the instance of anchor in Azure
  HTTPClient http;

  // Finished setup message && show MAC address
  Serial.println("MAC ADDRESS: " + macAnchor);
  Serial.println("Setup is done!");

  while (WiFi.status() != WL_CONNECTED) {}
  Serial.println("WiFi connection successful!");

  // CREA POSIZIONE STATICA
  http.begin("https://rtlswizardsfunctions.azurewebsites.net/api/anchor?");
  http.addHeader("Content-Type", "application/json");
  String data = "{\"macAddress\":\"" + String(macRequest) + "\",\"type\":\"anchor\",\"connected\":true}";
  Serial.println(data);

  int response_code_add = http.POST(data);
  if (response_code_add > 0) {
    Serial.printf("Risposta http: %d\n", response_code_add);
    String response = http.getString();
    Serial.println(response);
  } else {
    Serial.println("Error in the http request");
    Serial.println(response_code_add);
  }
  http.end();
}

// Run loop
void loop() {

  // Activate reception immediately
  dwt_rxenable(DWT_START_RX_IMMEDIATE);

  // Poll for reception of a frame or error/timeout
  while (!((status_reg = dwt_read32bitreg(SYS_STATUS_ID)) & (SYS_STATUS_RXFCG_BIT_MASK | SYS_STATUS_ALL_RX_ERR)))
    ;
  if (status_reg & SYS_STATUS_RXFCG_BIT_MASK) {
    uint32_t frame_len;

    // Clear good RX frame event in the DW IC status register
    dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_RXFCG_BIT_MASK);

    // A frame has been received, read it into the local buffer
    frame_len = dwt_read32bitreg(RX_FINFO_ID) & RXFLEN_MASK;
    if (frame_len <= sizeof(rx_buffer)) {
      dwt_readrxdata(rx_buffer, frame_len, 0);

      /* Check that the frame is a poll sent by "UWB Anchor" example.
         As the sequence number field of the frame is not relevant, it is cleared to simplify the validation of the frame. */
      rx_buffer[ALL_MSG_SN_IDX] = 0;
      if (memcmp(rx_buffer, rx_poll_msg, ALL_MSG_COMMON_LEN) == 0) {
        uint32_t resp_tx_time;
        int ret;

        // Retrieve poll reception timestamp
        poll_rx_ts = get_rx_timestamp_u64();

        // Compute response message transmission time
        resp_tx_time = (poll_rx_ts + (POLL_RX_TO_RESP_TX_DLY_UUS * UUS_TO_DWT_TIME)) >> 8;
        dwt_setdelayedtrxtime(resp_tx_time);

        // Response TX timestamp is the transmission time we programmed plus the antenna delay
        resp_tx_ts = (((uint64_t)(resp_tx_time & 0xFFFFFFFEUL)) << 8) + TX_ANT_DLY;

        // Write all timestamps in the final message
        resp_msg_set_ts(&tx_resp_msg[RESP_MSG_POLL_RX_TS_IDX], poll_rx_ts);
        resp_msg_set_ts(&tx_resp_msg[RESP_MSG_RESP_TX_TS_IDX], resp_tx_ts);

        // Write and send the response message
        tx_resp_msg[ALL_MSG_SN_IDX] = frame_seq_nb;
        dwt_writetxdata(sizeof(tx_resp_msg), tx_resp_msg, 0);  // Zero offset in TX buffer
        dwt_writetxfctrl(sizeof(tx_resp_msg), 0, 1);           // Zero offset in TX buffer, ranging
        ret = dwt_starttx(DWT_START_TX_DELAYED);

        // If dwt_starttx() returns an error, abandon this ranging exchange and proceed to the next one
        if (ret == DWT_SUCCESS) {

          // Poll DW IC until TX frame sent event set
          while (!(dwt_read32bitreg(SYS_STATUS_ID) & SYS_STATUS_TXFRS_BIT_MASK))
            ;

          // Clear TXFRS event
          dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_TXFRS_BIT_MASK);

          // Increment frame sequence number after transmission of the poll message
          frame_seq_nb++;
        }
      }
    }
  } else {
    // Clear RX error events in the DW IC status register
    dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_ALL_RX_ERR);
  }
}