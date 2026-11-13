import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import { DesignSettings } from "./design-system/DesignSettings";
import "./styles.css";
import "./design-system/tokens.css";
import "./features/features.css";
import "./features/wallet/localWallet.css";
import "./ui/premium/premium.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
      <DesignSettings />
    </MotionConfig>
  </React.StrictMode>
);
