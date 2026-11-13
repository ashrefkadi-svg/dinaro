/// <reference types="vite/client" />
import React from "react";
import ReactDOM from "react-dom/client";
import MobilePreview from "./MobilePreview";
import "./mobile.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><MobilePreview/></React.StrictMode>
);
