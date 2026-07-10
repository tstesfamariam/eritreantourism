import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import EatIndex from "./pages/EatIndex.jsx";
import RestaurantPage from "./pages/RestaurantPage.jsx";
import "./index.css";

// /eat and /eat/:slug are real routes; everything else falls through to the
// legacy App, unchanged — App never reads the URL, so this is purely
// additive and doesn't touch the existing (live) hotel booking flow.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/eat" element={<EatIndex />} />
          <Route path="/eat/:slug" element={<RestaurantPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
