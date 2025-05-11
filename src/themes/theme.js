import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#F6404F",
      light: "#FDD9DC",
    },
    background: {
      default: "#FFFFFF",
      paper: "#F8F9FA",
    },
    grey: {
      100: "#CED4DA",
    },
    text: {
      primary: "#14142B",
      secondary: "#4E4B66",
    },
    success: {
      main: "#27AE60",
    },
  },
});

export default theme;
