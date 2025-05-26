import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <CssBaseline />
    <GlobalStyles
      styles={{
        html: {
          fontFamily: "'Poppins', sans-serif",
        },
        body: {
          fontFamily: "'Poppins', sans-serif",
        },
        "*": {
          fontFamily: "'Poppins', sans-serif !important",
        },
        "*::before": {
          fontFamily: "'Poppins', sans-serif !important",
        },
        "*::after": {
          fontFamily: "'Poppins', sans-serif !important",
        },
      }}
    />
    <App />
  </>
);
