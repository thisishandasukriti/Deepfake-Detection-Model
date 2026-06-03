import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create theme with Poppins
const theme = createTheme({
  typography: {
    fontFamily: "'Roboto'", 
    h1: { fontFamily: "'Poppins'" },
    h2: { fontFamily: "'Inter'" },
    h3: { fontFamily: "'Inter'" },
    h4: { fontFamily: "'Roboto'" },
    h5: { fontFamily: "'Roboto'" },
    h6: { fontFamily: "'Roboto'" },
    body1: { fontFamily: "'Roboto'" },
    body2: { fontFamily: "'Roboto'" },
  },
});

export default theme;


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
