// pages/_app.tsx
import { AppProps } from "next/app";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "../lib/theme";
import { useState, useMemo, useEffect } from "react";
import "../styles/forest-animations.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [darkMode, setDarkMode] = useState(false); // Start with light mode to match SSR
  const [mounted, setMounted] = useState(false);

  // Handle hydration by setting the correct theme after mount
  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      // Default to dark mode if no preference is saved
      setDarkMode(true);
    }
  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }
  }, [darkMode, mounted]);

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Component {...pageProps} darkMode={false} setDarkMode={setDarkMode} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} darkMode={darkMode} setDarkMode={setDarkMode} />
    </ThemeProvider>
  );
}
