import { createTheme } from "@mui/material/styles";

const getTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#1f6f8b"
      },
      secondary: {
        main: "#f2a65a"
      },
      background: {
        default: mode === "light" ? "#f5f7fb" : "#0f1c24",
        paper: mode === "light" ? "#ffffff" : "#152733"
      }
    },
    typography: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }
  });

export default getTheme;
