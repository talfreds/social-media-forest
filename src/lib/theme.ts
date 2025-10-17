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

// Forest Light Theme - Sunny Meadow
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2E7D32", // Forest green
      light: "#4CAF50",
      dark: "#1B5E20",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#795548", // Warm brown
      light: "#A1887F",
      dark: "#5D4037",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F1F8E9", // Light green-cream
      paper: "#FFFFFF", // Pure white paper
    },
    text: {
      primary: "#1B5E20", // Dark forest green
      secondary: "#558B2F", // Medium forest green
    },
    divider: "#C5E1A5", // Light green divider
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
    warning: {
      main: "#FF9800",
      light: "#FFB74D",
      dark: "#F57C00",
    },
    error: {
      main: "#F44336",
      light: "#E57373",
      dark: "#D32F2F",
    },
    info: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
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
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
        contained: {
          backgroundColor: "#2E7D32",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#4CAF50",
            boxShadow: "0 4px 8px rgba(46, 125, 50, 0.3)",
          },
        },
        outlined: {
          borderColor: "#2E7D32",
          color: "#2E7D32",
          "&:hover": {
            backgroundColor: "rgba(46, 125, 50, 0.08)",
            borderColor: "#4CAF50",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "1px solid #C5E1A5",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "#C5E1A5",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "#4CAF50",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2E7D32",
              borderWidth: "2px",
            },
          },
          "& .MuiInputBase-input": {
            color: "#1B5E20",
          },
          "& .MuiInputLabel-root": {
            color: "#558B2F",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2E7D32",
          borderBottom: "1px solid #1B5E20",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E8F5E9",
          "&:hover": {
            backgroundColor: "rgba(46, 125, 50, 0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "2px solid #C5E1A5",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      },
    },
  },
});

// Forest background patterns and utilities
export const forestBackgrounds = {
  // Dark mode backgrounds
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
  // Light mode backgrounds
  sunnyMeadow: `
    linear-gradient(135deg,
      #F1F8E9 0%,
      #DCEDC8 25%,
      #F1F8E9 50%,
      #E8F5E9 75%,
      #F1F8E9 100%
    ),
    radial-gradient(ellipse at 20% 50%, rgba(129, 199, 132, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(174, 213, 129, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(197, 225, 165, 0.2) 0%, transparent 50%)
  `,
  springGarden: `
    linear-gradient(135deg,
      #E8F5E9 0%,
      #F1F8E9 25%,
      #E8F5E9 50%,
      #C8E6C9 75%,
      #E8F5E9 100%
    ),
    radial-gradient(ellipse at 30% 30%, rgba(102, 187, 106, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(139, 195, 74, 0.08) 0%, transparent 60%)
  `,
  goldenClearing: `
    linear-gradient(135deg,
      #FFF8E1 0%,
      #F1F8E9 25%,
      #FFFDE7 50%,
      #F1F8E9 75%,
      #FFF8E1 100%
    ),
    radial-gradient(ellipse at 25% 25%, rgba(255, 235, 59, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 75%, rgba(205, 220, 57, 0.1) 0%, transparent 50%)
  `,
};

export { lightTheme, forestDarkTheme as darkTheme };
