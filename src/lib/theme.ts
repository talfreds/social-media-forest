// lib/theme.ts
import { createTheme } from "@mui/material/styles";

// Dark Reddit Theme Typography
const redditTypography = {
  fontFamily:
    "'IBM Plex Sans', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  h1: {
    fontSize: "1.5rem",
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h2: {
    fontSize: "1.25rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h3: {
    fontSize: "1.125rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "0.8125rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    textTransform: "none" as const,
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.4,
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
};

// Dark Reddit Theme
const darkRedditTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0079D3", // Reddit blue
      light: "#4F9CF9",
      dark: "#005BA1",
    },
    secondary: {
      main: "#717273", // Reddit gray
      light: "#8A8D8F",
      dark: "#484A4C",
    },
    background: {
      default: "#030303", // Very dark background like Reddit
      paper: "#1A1A1B", // Reddit post background
    },
    text: {
      primary: "#D7DADC", // Reddit light text
      secondary: "#818384", // Reddit secondary text
    },
    divider: "#343536", // Reddit divider color
  },
  typography: redditTypography,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          padding: "8px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          textTransform: "none" as const,
        },
        contained: {
          backgroundColor: "#0079D3",
          "&:hover": {
            backgroundColor: "#4F9CF9",
          },
        },
        outlined: {
          borderColor: "#343536",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "#D7DADC",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1B",
          border: "1px solid #343536",
          borderRadius: "4px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1A1A1B",
            "& fieldset": {
              borderColor: "#343536",
            },
            "&:hover fieldset": {
              borderColor: "#D7DADC",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0079D3",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1B",
          borderBottom: "1px solid #343536",
          boxShadow: "none",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #343536",
          "&:hover": {
            backgroundColor: "#2D2D2E",
          },
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
  typography: redditTypography,
});

export { lightTheme, darkRedditTheme as darkTheme };
