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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Brightness7, Brightness4 } from "@mui/icons-material";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";
import ForestSection, { ForestType } from "./ForestSection";
import Image from "next/image";

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
  const [showLoginError, setShowLoginError] = useState(false);
  const [newSectionOpen, setNewSectionOpen] = useState(false);
  const [currentForest, setCurrentForest] = useState<ForestType>("deep-woods");

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

  const handleOpenNewSection = () => {
    if (!isLoggedIn) {
      setShowLoginError(true);
      return;
    }
    setNewSectionOpen(true);
  };

  const handleCloseNewSection = () => setNewSectionOpen(false);

  const getForestName = (type: ForestType): string => {
    const names = {
      "deep-woods": "Ancient Deep Woods",
      "misty-grove": "Misty Grove",
      "autumn-forest": "Autumn Forest",
      "pine-forest": "Pine Forest",
      "oak-grove": "Oak Grove",
    };
    return names[type];
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar
        sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Image src="/monkey.svg" alt="Monkey" width={32} height={32} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button variant="outlined" onClick={handleOpenNewSection}>
            New Section
          </Button>
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
        </Box>
        <Snackbar
          open={showLoginError}
          autoHideDuration={3000}
          onClose={() => setShowLoginError(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" onClose={() => setShowLoginError(false)}>
            You must be logged in to create a new section.
          </Alert>
        </Snackbar>

        <Dialog
          open={newSectionOpen}
          onClose={handleCloseNewSection}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
            <Typography variant="h4" sx={{ color: "#4A6741", fontWeight: 700 }}>
              🌲 Choose Your Forest 🌲
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "#6B8B5A" }}>
              Select a forest realm to explore and contribute to
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
                mt: 2,
              }}
            >
              <ForestSection
                type="deep-woods"
                title="Ancient Deep Woods"
                description="The heart of the forest where ancient wisdom and deep thoughts flourish. Perfect for philosophical discussions and profound insights."
                isActive={currentForest === "deep-woods"}
                onClick={() => setCurrentForest("deep-woods")}
              />

              <ForestSection
                type="misty-grove"
                title="Misty Grove"
                description="A serene and contemplative space shrouded in gentle mist. Ideal for reflective thoughts and peaceful conversations."
                isActive={currentForest === "misty-grove"}
                onClick={() => setCurrentForest("misty-grove")}
              />

              <ForestSection
                type="autumn-forest"
                title="Autumn Forest"
                description="Where golden leaves fall like shared memories. A place for warm, nostalgic discussions and seasonal reflections."
                isActive={currentForest === "autumn-forest"}
                onClick={() => setCurrentForest("autumn-forest")}
              />

              <ForestSection
                type="pine-forest"
                title="Pine Forest"
                description="Tall pines reaching toward the sky. Home to evergreen thoughts that persist through all seasons."
                isActive={currentForest === "pine-forest"}
                onClick={() => setCurrentForest("pine-forest")}
              />

              <ForestSection
                type="oak-grove"
                title="Oak Grove"
                description="Mighty oaks forming a sacred circle. A gathering place for community wisdom and enduring conversations."
                isActive={currentForest === "oak-grove"}
                onClick={() => setCurrentForest("oak-grove")}
              />
            </Box>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#6B8B5A", mb: 2 }}>
                Currently exploring:{" "}
                <strong>{getForestName(currentForest)}</strong>
              </Typography>
              <Button
                variant="contained"
                onClick={handleCloseNewSection}
                sx={{
                  bgcolor: "#4A6741",
                  "&:hover": { bgcolor: "#6B8B5A" },
                  px: 4,
                  py: 1.5,
                  borderRadius: "25px",
                }}
              >
                Enter {getForestName(currentForest)}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
}
