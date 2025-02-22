// lib/theme.ts
import { createTheme } from "@mui/material/styles";

// Custom Light Theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4CAF50", // Green from your Register button
    },
    secondary: {
      main: "#2196F3", // Blue from your Login button
    },
    background: {
      default: "#f9f9f9", // Light gray background
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 500 },
    button: { textTransform: "none" }, // No uppercase buttons
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          padding: "12px 24px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
  },
});

// Custom Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#81C784", // Lighter green for dark mode
    },
    secondary: {
      main: "#64B5F6", // Lighter blue for dark mode
    },
    background: {
      default: "#212121", // Dark gray background
      paper: "#424242",
    },
    text: {
      primary: "#E0E0E0",
      secondary: "#B0B0B0",
    },
  },
  typography: lightTheme.typography, // Reuse typography
  components: lightTheme.components, // Reuse component overrides
});

export { lightTheme, darkTheme };
