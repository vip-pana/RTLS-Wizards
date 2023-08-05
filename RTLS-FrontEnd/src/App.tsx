import { BrowserRouter, Routes, Route } from "react-router-dom";

// UI
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

// PAGES
import { Base } from "./pages/Base";
import { MapPage } from "./pages/MapPage";
import { DeviceGridPage } from "./pages/DeviceGridPage";
import { DevicePage } from "./pages/DevicePage";
import { SetupModal } from "./components/setup/SetupModal";
import { SetupBase } from "./pages/setup/SetupBase";
import { SetSitePage } from "./pages/SetSitePage";
import { useState } from "react";
import { SearchPage } from "./pages/SearchPage";
import { HistoryPage } from "./pages/HistoryPage";

function App() {
  const [defaultTimer] = useState(3000);

  // return time frequency for useEffect
  const getTimeFrequency = (): number => {
    const timer = localStorage.getItem("refreshingTime");

    if (timer) {
      return parseInt(timer);
    } else {
      return defaultTimer;
    }
  };

  return (
    <>
      <ColorModeScript />
      <ChakraProvider>
        <BrowserRouter>
          <Routes>
            <Route
              element={
                sessionStorage.getItem("site") ? <Base /> : <SetSitePage />
              }
            >
              <Route element={<SetupModal />}>
                <Route
                  path="/"
                  element={<MapPage getTimeFrequency={getTimeFrequency} />}
                />
                <Route
                  path="/device-grid"
                  element={
                    <DeviceGridPage getTimeFrequency={getTimeFrequency} />
                  }
                />
                <Route
                  path="/device-grid/:type/:macAddress"
                  element={<DevicePage getTimeFrequency={getTimeFrequency} />}
                />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Route>
            </Route>
            <Route path="/setup" element={<SetupBase />}></Route>
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </>
  );
}

export default App;
