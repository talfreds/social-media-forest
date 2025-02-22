// components/MenuBar.tsx
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Brightness7, Brightness4 } from "@mui/icons-material";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";

interface MenuBarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isLoggedIn: boolean;
}

export default function MenuBar({
  darkMode,
  setDarkMode,
  isLoggedIn,
}: MenuBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formType, setFormType] = useState<"register" | "login" | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    type: "register" | "login"
  ) => {
    setAnchorEl(event.currentTarget);
    setFormType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setFormType(null);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "flex-end", flexWrap: "wrap", gap: 1 }}>
        {!isLoggedIn ? (
          <>
            <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => handleMenuOpen(e, "register")}
                size="medium"
                sx={{ minWidth: { xs: "80px", sm: "100px" } }} // Smaller on mobile
              >
                Register
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={(e) => handleMenuOpen(e, "login")}
                size="medium"
                sx={{ minWidth: { xs: "80px", sm: "100px" } }}
              >
                Login
              </Button>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  width: "100%",
                  maxWidth: { xs: "90vw", sm: "300px" }, // 90% viewport width on mobile
                  mt: 1, // Space below button
                },
              }}
            >
              <MenuItem
                sx={{ p: 0, "&:hover": { backgroundColor: "transparent" } }}
              >
                {formType === "register" && <RegisterForm isVisible={true} />}
                {formType === "login" && <LoginForm isVisible={true} />}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <LogoutButton />
        )}
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              sx={{
                mx: 1, // Consistent spacing around switch
                "& .MuiSwitch-switchBase": {
                  // Base state (unchecked, light mode)
                  "& .MuiSwitch-thumb": {
                    bgcolor: "grey.500", // Neutral gray thumb in light mode
                  },
                  "& .MuiSwitch-track": {
                    bgcolor: "grey.300", // Light gray track in light mode
                  },
                },
                "& .MuiSwitch-switchBase.Mui-checked": {
                  // Checked state (dark mode)
                  "& .MuiSwitch-thumb": {
                    bgcolor: "grey.800", // Dark gray thumb in dark mode
                  },
                  "& .MuiSwitch-track": {
                    bgcolor: "grey.600", // Darker track in dark mode
                  },
                },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              color="text.primary" // Adapts to theme (black in light, white in dark)
              sx={{ ml: 0.5 }}
            >
              {darkMode ? "Dark" : "Light"}
            </Typography>
          }
          sx={{ m: 0 }} // No extra margin, rely on Toolbar spacing
        />
      </Toolbar>
    </AppBar>
  );
}
