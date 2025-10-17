// lib/theme.ts
import { createTheme } from "@mui/material/styles";

// Forest Theme Typography - Nature-inspired fonts
const forestTypography = {
  fontFamily:
    "'Quicksand', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  h1: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.5rem",
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: "1.25rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.3,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  h5: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "0.02em",
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    textTransform: "none" as const,
    fontWeight: 600,
    fontSize: "0.875rem",
    letterSpacing: "0.02em",
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.4,
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  },
};

// Forest Dark Theme - Deep Woods
const forestDarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4A6741", // Deep forest green
      light: "#6B8B5A",
      dark: "#2E4A26",
      contrastText: "#E8F5E8",
    },
    secondary: {
      main: "#8B6914", // Rich earth brown
      light: "#A68B5B",
      dark: "#6B4F11",
      contrastText: "#F5E6D3",
    },
    background: {
      default: "#0F1A0F", // Deep forest darkness
      paper: "#1A2D1A", // Dark forest floor
    },
    text: {
      primary: "#E8F5E8", // Light forest moss
      secondary: "#B8D4B8", // Muted sage green
    },
    divider: "#2E4A2E", // Dark forest divider
    success: {
      main: "#66BB6A", // Fresh leaf green
      light: "#81C784",
      dark: "#4CAF50",
    },
    warning: {
      main: "#FFA726", // Golden autumn leaf
      light: "#FFB74D",
      dark: "#FF9800",
    },
    error: {
      main: "#EF5350", // Berry red
      light: "#E57373",
      dark: "#F44336",
    },
    info: {
      main: "#42A5F5", // Sky blue
      light: "#64B5F6",
      dark: "#2196F3",
    },
  },
  typography: forestTypography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "0.875rem",
          fontWeight: 600,
          textTransform: "none" as const,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        },
        contained: {
          backgroundColor: "#4A6741",
          "&:hover": {
            backgroundColor: "#6B8B5A",
            boxShadow: "0 4px 12px rgba(74, 103, 65, 0.4)",
          },
        },
        outlined: {
          borderColor: "#4A6741",
          color: "#4A6741",
          "&:hover": {
            backgroundColor: "rgba(74, 103, 65, 0.1)",
            borderColor: "#6B8B5A",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(26, 45, 26, 0.9)",
          border: "1px solid #2E4A2E",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(26, 45, 26, 0.8)",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "#4A6741",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "#6B8B5A",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#66BB6A",
              borderWidth: "2px",
            },
          },
          "& .MuiInputBase-input": {
            color: "#E8F5E8",
          },
          "& .MuiInputLabel-root": {
            color: "#B8D4B8",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(15, 26, 15, 0.95)",
          borderBottom: "1px solid #2E4A2E",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(20px)",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #2E4A2E",
          "&:hover": {
            backgroundColor: "rgba(74, 103, 65, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(26, 45, 26, 0.9)",
          border: "1px solid #2E4A2E",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        },
      },
    },
  },
});

// Light theme (minimal, not the focus)
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0079D3",
    },
    secondary: {
      main: "#717273",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1B",
      secondary: "#717273",
    },
  },
  typography: forestTypography,
});

// Forest background patterns and utilities
export const forestBackgrounds = {
  deepWoods: `
    linear-gradient(135deg,
      #0F1A0F 0%,
      #1A2D1A 25%,
      #0F1A0F 50%,
      #1A2D1A 75%,
      #0F1A0F 100%
    ),
    radial-gradient(ellipse at 20% 50%, rgba(74, 103, 65, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(107, 139, 90, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(46, 74, 38, 0.4) 0%, transparent 50%)
  `,
  mistyGrove: `
    linear-gradient(135deg,
      #1A2D1A 0%,
      #2E4A2E 25%,
      #1A2D1A 50%,
      #2E4A2E 75%,
      #1A2D1A 100%
    ),
    radial-gradient(ellipse at 30% 30%, rgba(184, 212, 184, 0.2) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(139, 105, 20, 0.15) 0%, transparent 60%)
  `,
  autumnWoods: `
    linear-gradient(135deg,
      #2E4A2E 0%,
      #4A6741 25%,
      #2E4A2E 50%,
      #6B4F11 75%,
      #2E4A2E 100%
    ),
    radial-gradient(ellipse at 25% 25%, rgba(255, 167, 38, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 75%, rgba(139, 69, 19, 0.15) 0%, transparent 50%)
  `,
};

export { lightTheme, forestDarkTheme as darkTheme };
