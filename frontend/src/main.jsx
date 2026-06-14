import React from "react";
import ReactDOM from "react-dom/client";
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "antd/dist/reset.css";
import "./assets/styles.css";
import App from "./App.jsx";

const theme = {
  token: {
    colorPrimary: "#2563eb",
    colorInfo: "#2563eb",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    borderRadius: 16,
    wireframe: false,
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif',
  },
  components: {
    Layout: {
      headerBg: "rgba(255, 255, 255, 0.62)",
      siderBg: "rgba(255, 255, 255, 0.62)",
    },
    Card: {
      boxShadowTertiary: "0 22px 70px rgba(15, 23, 42, 0.10)",
    },
    Table: {
      headerBg: "rgba(248, 250, 252, 0.72)",
      headerColor: "#334155",
      rowHoverBg: "rgba(239, 246, 255, 0.72)",
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
