// Necessary modules
#include <dw3000.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h>

// App name to run UWB initial test
#define APP_NAME "UWB Tag"

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
static uint8_t tx_poll_msg[] = { 0x41, 0x88, 0, 0xCA, 0xDE, 'W', 'A', 'V', 'E', 0xE0, 0, 0 };
static uint8_t rx_resp_msg[] = { 0x00, 0x88, 0, 0xCA, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xE1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };

// Length of the common part of the message
#define ALL_MSG_COMMON_LEN 3

// Indexes to access some of the fields in the frames defined above
#define ALL_MSG_SN_IDX 2
#define RESP_MSG_POLL_RX_TS_IDX 10
#define RESP_MSG_RESP_TX_TS_IDX 14

// Frame sequence number, incremented after each transmission
static uint8_t frame_seq_nb = 0;

// Buffer to store received response message (must be less than FRAME_LEN_MAX_EX)
static uint8_t rx_buffer[25];

// Hold copy of status register
static uint32_t status_reg = 0;

// Delay between frames (in UWB microseconds)
#define POLL_TX_TO_RESP_RX_DLY_UUS 240

// Receive response timeout
#define RESP_RX_TIMEOUT_UUS 400

// Hold copies of computed time of flight and distance
static double tof;
static double distance;

/* Values for the PG_DELAY and TX_POWER registers reflect the bandwidth and power of the spectrum at the current
   temperature. These values can be calibrated prior to taking reference measurements. */
extern dwt_txconfig_t txconfig_options;

// Run setup
void setup() {

  // Baud setting && module startup
  Serial.begin(115200);
  test_run_info((unsigned char *)APP_NAME);

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

  /* Set expected response's delay and timeout.
     As this example only handles one incoming frame with always the same delay and timeout, those values can be set here once for all. */
  dwt_setrxaftertxdelay(POLL_TX_TO_RESP_RX_DLY_UUS);
  dwt_setrxtimeout(RESP_RX_TIMEOUT_UUS);

  /* Next can enable TX/RX states output on GPIOs 5 and 6 to help debug, and also TX/RX LEDs
     Note, in real low power applications the LEDs should not be used. */
  dwt_setlnapamode(DWT_LNA_ENABLE | DWT_PA_ENABLE);

  // Finished setup message
  Serial.println("Setup is done!");
  // Setting message to send partial MAC address
  String mac = WiFi.macAddress();
  String macRequest = mac.substring(9);
  macRequest.replace(":", "");

  // Create WiFiManager object
  WiFiManager wfm;

  // Supress Debug information
  wfm.setDebugOutput(false);

  // Remove any previous network settings
  //wfm.resetSettings();

  // Attempt Wi-Fi connection
  wfm.autoConnect(macRequest.c_str(), "dw3000esp32");

  HTTPClient http;

  while (WiFi.status() != WL_CONNECTED) { }
  Serial.println("WiFi connection successful!");

  // CREA POSIZIONE STATICA
  http.begin("https://rtlswizardsfunctions.azurewebsites.net/api/tag?");
  http.addHeader("Content-Type", "application/json");
  String data = "{\"macAddress\":\"" + String(macRequest) + "\",\"type\":\"tag\"}";
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

  // Finished setup message && show MAC address
  Serial.println("TAG MAC ADDRESS: " + mac);
  Serial.println("Setup is done!");
}

// Run loop
void loop() {
  // Attempt Wi-Fi connection
  while (WiFi.status() != WL_CONNECTED) {}
  Serial.println("WiFi connection successful!");

  // Print local IP address and MAC address when connected
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Actual loop if WiFi is connected
  Serial.println("Listening for anchors...");
  while (WiFi.status() == WL_CONNECTED) {

    // Write frame data to DW IC and prepare transmission
    tx_poll_msg[ALL_MSG_SN_IDX] = frame_seq_nb;
    dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_TXFRS_BIT_MASK);
    dwt_writetxdata(sizeof(tx_poll_msg), tx_poll_msg, 0);  // Zero offset in TX buffer
    dwt_writetxfctrl(sizeof(tx_poll_msg), 0, 1);           // Zero offset in TX buffer (ranging)

    /* Start transmission, indicating that a response is expected so that reception is enabled automatically after the frame is sent and the delay
      set by dwt_setrxaftertxdelay() has elapsed. */
    dwt_starttx(DWT_START_TX_IMMEDIATE | DWT_RESPONSE_EXPECTED);

    // We assume that the transmission is achieved correctly, poll for reception of a frame or error/timeout
    while (!((status_reg = dwt_read32bitreg(SYS_STATUS_ID)) & (SYS_STATUS_RXFCG_BIT_MASK | SYS_STATUS_ALL_RX_TO | SYS_STATUS_ALL_RX_ERR)))
      ;

    // Increment frame sequence number after transmission of the poll message
    frame_seq_nb++;
    if (status_reg & SYS_STATUS_RXFCG_BIT_MASK) {
      uint32_t frame_len;

      // Clear good RX frame event in the DW IC status register
      dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_RXFCG_BIT_MASK);

      // A frame has been received, read it into the local buffer
      frame_len = dwt_read32bitreg(RX_FINFO_ID) & RXFLEN_MASK;
      if (frame_len <= sizeof(rx_buffer)) {
        dwt_readrxdata(rx_buffer, frame_len, 0);

        /* Check that the frame is the expected response from the companion "UWB Tag" example.
          As the sequence number field of the frame is not relevant, it is cleared to simplify the validation of the frame. */
        rx_buffer[ALL_MSG_SN_IDX] = 0;
        if (memcmp(rx_buffer, rx_resp_msg, ALL_MSG_COMMON_LEN) == 0) {
          uint32_t poll_tx_ts, resp_rx_ts, poll_rx_ts, resp_tx_ts;
          int32_t rtd_init, rtd_resp;
          float clockOffsetRatio;

          // Retrieve poll transmission and response reception timestamps
          poll_tx_ts = dwt_readtxtimestamplo32();
          resp_rx_ts = dwt_readrxtimestamplo32();

          // Read carrier integrator value and calculate clock offset ratio
          clockOffsetRatio = ((float)dwt_readclockoffset()) / (uint32_t)(1 << 26);

          // Get timestamps embedded in response message
          resp_msg_get_ts(&rx_buffer[RESP_MSG_POLL_RX_TS_IDX], &poll_rx_ts);
          resp_msg_get_ts(&rx_buffer[RESP_MSG_RESP_TX_TS_IDX], &resp_tx_ts);

          // Compute time of flight and distance (using clock offset ratio to correct for differing local and remote clock rates)
          rtd_init = resp_rx_ts - poll_tx_ts;
          rtd_resp = resp_tx_ts - poll_rx_ts;

          tof = ((rtd_init - rtd_resp * (1 - clockOffsetRatio)) / 2.0) * DWT_TIME_UNITS;
          distance = tof * SPEED_OF_LIGHT;

          // Print anchor's partial MAC address and its distance
          Serial.println();
          Serial.print("ANCHOR: ");
          for (int i = 4; i < 10; i++) Serial.print((char)rx_buffer[i]);
          Serial.println();
          snprintf(dist_str, sizeof(dist_str), "DIST: %3.2f m", distance);
          test_run_info((unsigned char *)dist_str);

          String mac_address_anchor = "";
          for (int i = 4; i < 10; i++) {
            char c = rx_buffer[i];
            mac_address_anchor += c;
          }
          Serial.println(mac_address_anchor);


          String mac_tag_addr = WiFi.macAddress();
          String mac_tag = mac_tag_addr.substring(9);
          mac_tag.replace(":", "");


          HTTPClient http;

          http.begin("https://rtlswizardsfunctions.azurewebsites.net/api/distance?");
          http.addHeader("Content-Type", "application/json");

          String data = "{\"anchorMac\":\"" + String(mac_address_anchor) + "\",\"measure\":\"" + String(distance) + "\",\"tagMac\":\"" + String(mac_tag) + "\"}";
          //String data = "{\"anchorMac\":\"" + String("anchoraTest3") + "\",\"measure\":\"" + String(distance) + "\",\"tagMac\":\"" + String("ABV312") + "\"}";
          Serial.println(data);

          int response_code = http.POST(data);
          if (response_code > 0) {
            Serial.printf("Risposta http: %d\n", response_code);
            String response = http.getString();
            Serial.println(response);
          } else {
            Serial.println("Error in the http request");
            Serial.println(response_code);
          }
          http.end();
        }
      }
    } else {

      // Clear RX error/timeout events in the DW IC status register
      dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_ALL_RX_TO | SYS_STATUS_ALL_RX_ERR);
    }

    // Execute a delay between ranging exchanges
    delay(400);
  }

  // Print warning message if the WiFi connetion is lost
  Serial.println("\nLost connection to WiFi network!");
}