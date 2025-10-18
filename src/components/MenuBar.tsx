// components/MenuBar.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { Forest, Pets, BugReport, Water, AcUnit } from "@mui/icons-material";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";
import Image from "next/image";

interface MenuBarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isLoggedIn: boolean;
  currentUser?: { id: string; name: string | null; avatar?: string } | null;
  currentForestId?: string | null;
  currentForestName?: string | null;
  onOpenRegister?: () => void;
}

interface ForestData {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  _count: { posts: number };
}

export default function MenuBar({
  darkMode,
  setDarkMode,
  isLoggedIn,
  currentUser,
  currentForestId,
  currentForestName,
  onOpenRegister,
}: MenuBarProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formType, setFormType] = useState<"register" | "login" | null>(null);
  const [showLoginError, setShowLoginError] = useState(false);

  // Separate modals for different actions
  const [changeForestOpen, setChangeForestOpen] = useState(false);
  const [createForestOpen, setCreateForestOpen] = useState(false);

  const [forests, setForests] = useState<ForestData[]>([]);
  const [selectedForestId, setSelectedForestId] = useState<string | null>(
    currentForestId || null
  );
  const [newForestName, setNewForestName] = useState("");
  const [newForestDesc, setNewForestDesc] = useState("");
  const [newForestPrivate, setNewForestPrivate] = useState(false);
  const [forestError, setForestError] = useState("");
  const [loadingForests, setLoadingForests] = useState(false);

  // Fetch forests on mount for the forest list display
  useEffect(() => {
    const fetchForests = async () => {
      try {
        const res = await fetch("/api/forests");
        if (res.ok) {
          const data = await res.json();
          setForests(data);
        }
      } catch (error) {
        console.error("Error fetching forests:", error);
      }
    };
    fetchForests();
  }, []);

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

  const handleOpenChangeForest = async () => {
    setChangeForestOpen(true);
    setLoadingForests(true);
    try {
      const res = await fetch("/api/forests");
      if (res.ok) {
        const data = await res.json();
        setForests(data);
      } else {
        console.error("Failed to fetch forests:", res.status);
      }
    } catch (error) {
      console.error("Error fetching forests:", error);
    } finally {
      setLoadingForests(false);
    }
  };

  const handleCloseChangeForest = () => {
    setChangeForestOpen(false);
  };

  const handleSelectForest = (forestId: string | null) => {
    setSelectedForestId(forestId);
    // Auto-submit when forest is selected
    if (forestId === null) {
      router.push("/");
    } else {
      router.push(`/?forest=${forestId}`);
    }
    setChangeForestOpen(false);
  };

  const handleOpenCreateForest = () => {
    if (!isLoggedIn) {
      setShowLoginError(true);
      return;
    }
    setCreateForestOpen(true);
  };

  const handleCloseCreateForest = () => {
    setCreateForestOpen(false);
    setNewForestName("");
    setNewForestDesc("");
    setNewForestPrivate(false);
    setForestError("");
  };

  const handleCreateForest = async () => {
    if (!isLoggedIn) {
      setForestError("Please log in to create a forest");
      if (onOpenRegister) {
        onOpenRegister();
      }
      return;
    }

    if (!newForestName.trim()) {
      setForestError("Forest name is required");
      return;
    }

    try {
      const res = await fetch("/api/forests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newForestName.trim(),
          description: newForestDesc.trim(),
          isPrivate: newForestPrivate,
        }),
      });

      if (res.ok) {
        const newForest = await res.json();
        handleCloseCreateForest();
        router.push(`/?forest=${newForest.id}`);
      } else {
        const error = await res.json();
        setForestError(error.error || "Failed to create forest");
      }
    } catch (error) {
      console.error("Error creating forest:", error);
      setForestError("An error occurred while creating the forest");
    }
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        bgcolor: darkMode ? "background.paper" : "#4A6741",
      }}
    >
      <Toolbar
        sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}
      >
        {/* Left Section - Logo and Forest Navigation */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Image src="/monkey.svg" alt="Monkey" width={32} height={32} />

          {/* Current Forest - Clickable */}
          <Button
            onClick={() => {
              if (currentForestId) {
                router.push(`/?forest=${currentForestId}`);
              } else {
                router.push("/");
              }
            }}
            sx={{
              color: "#E8F5E8",
              fontWeight: 700,
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1,
              textTransform: "none",
              fontSize: "1.25rem",
              minWidth: "auto",
              px: 1,
              "&:hover": {
                backgroundColor: "rgba(232, 245, 232, 0.1)",
              },
            }}
          >
            <Forest fontSize="small" />
            {currentForestName || "All Forests"}
          </Button>

          {/* Other Forests - Truncated List */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              overflow: "hidden",
            }}
          >
            {forests
              .filter((f) => f.id !== currentForestId)
              .slice(0, 3)
              .map((forest) => (
                <Button
                  key={forest.id}
                  onClick={() => router.push(`/?forest=${forest.id}`)}
                  sx={{
                    color: "rgba(232, 245, 232, 0.6)",
                    fontSize: "0.8rem",
                    textTransform: "none",
                    minWidth: "auto",
                    px: 1,
                    py: 0.5,
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      color: "#E8F5E8",
                      backgroundColor: "rgba(232, 245, 232, 0.1)",
                    },
                  }}
                >
                  {forest.name}
                </Button>
              ))}
          </Box>
        </Box>

        {/* Center Section - Forest Management */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleOpenChangeForest}
            sx={{
              minWidth: "auto",
              borderColor: darkMode ? "#B8D4B8" : "#E8F5E8",
              color: "#E8F5E8",
              "&:hover": {
                borderColor: "#FFFFFF",
                backgroundColor: darkMode
                  ? "rgba(184, 212, 184, 0.1)"
                  : "rgba(232, 245, 232, 0.1)",
              },
            }}
          >
            Change Forest
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenCreateForest}
            sx={{
              bgcolor: "#4A6741",
              "&:hover": { bgcolor: "#6B8B5A" },
              minWidth: "auto",
            }}
          >
            New Forest
          </Button>
        </Box>

        {/* Right Section - User Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isLoggedIn && (
            <Button
              variant="outlined"
              href="/friends"
              sx={{
                minWidth: "auto",
                display: { xs: "none", sm: "flex" },
                borderColor: darkMode ? "#B8D4B8" : "#E8F5E8",
                color: "#E8F5E8",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  backgroundColor: darkMode
                    ? "rgba(184, 212, 184, 0.1)"
                    : "rgba(232, 245, 232, 0.1)",
                },
              }}
            >
              Friends
            </Button>
          )}
          {isLoggedIn && currentUser && (
            <Button
              variant="outlined"
              href={`/user/${currentUser.id}`}
              sx={{
                minWidth: "auto",
                display: "flex",
                alignItems: "center",
                gap: 1,
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                borderColor: darkMode ? "#B8D4B8" : "#E8F5E8",
                color: "#E8F5E8",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  backgroundColor: darkMode
                    ? "rgba(184, 212, 184, 0.1)"
                    : "rgba(232, 245, 232, 0.1)",
                },
              }}
            >
              {currentUser.avatar === "cat" && <Pets fontSize="small" />}
              {currentUser.avatar === "dog" && <BugReport fontSize="small" />}
              {currentUser.avatar === "fish" && <Water fontSize="small" />}
              {currentUser.avatar === "lizard" && <AcUnit fontSize="small" />}
              {(currentUser.avatar === "monkey" || !currentUser.avatar) && (
                <Forest fontSize="small" />
              )}
              {currentUser.name || "User"}
            </Button>
          )}
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

        {/* Change Forest Dialog */}
        <Dialog
          open={changeForestOpen}
          onClose={handleCloseChangeForest}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
            <Typography variant="h4" sx={{ color: "#4A6741", fontWeight: 700 }}>
              🌲 Change Forest 🌲
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "#6B8B5A" }}>
              Switch to a different forest realm
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 2 }}>
            {loadingForests ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography>Loading forests...</Typography>
              </Box>
            ) : (
              <List>
                {/* All Forests option */}
                <ListItemButton
                  selected={selectedForestId === null}
                  onClick={() => handleSelectForest(null)}
                  sx={{
                    borderRadius: "8px",
                    mb: 1,
                    border:
                      selectedForestId === null
                        ? "2px solid #4A6741"
                        : "1px solid #E0E0E0",
                    "&.Mui-selected": {
                      bgcolor: "rgba(74, 103, 65, 0.1)",
                    },
                  }}
                >
                  <ListItemText
                    primary="🌍 All Forests"
                    secondary="View posts from all forests"
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>

                {/* Forest list */}
                {forests.map((forest) => (
                  <ListItemButton
                    key={forest.id}
                    selected={selectedForestId === forest.id}
                    onClick={() => handleSelectForest(forest.id)}
                    sx={{
                      borderRadius: "8px",
                      mb: 1,
                      border:
                        selectedForestId === forest.id
                          ? "2px solid #4A6741"
                          : "1px solid #E0E0E0",
                      "&.Mui-selected": {
                        bgcolor: "rgba(74, 103, 65, 0.1)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>{forest.isPrivate ? "🔒" : "🌲"}</span>
                          <span>{forest.name}</span>
                        </Box>
                      }
                      secondary={
                        forest.description || `${forest._count.posts} posts`
                      }
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                ))}

                {forests.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" sx={{ color: "#6B8B5A" }}>
                      No forests created yet. Create your first forest!
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Forest Dialog */}
        <Dialog
          open={createForestOpen}
          onClose={handleCloseCreateForest}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
            <Typography variant="h4" sx={{ color: "#4A6741", fontWeight: 700 }}>
              🌱 Plant a New Forest 🌱
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "#6B8B5A" }}>
              Create your own forest realm
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <TextField
              label="Forest Name"
              value={newForestName}
              onChange={(e) => setNewForestName(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              error={!!forestError}
              placeholder="e.g. Mystic Woods, Vancouver, New York Travel"
            />
            <TextField
              label="Description (optional)"
              value={newForestDesc}
              onChange={(e) => setNewForestDesc(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
              placeholder="Describe the vibe and purpose of your forest..."
            />
            {forestError && (
              <Typography variant="body2" sx={{ color: "error.main", mb: 2 }}>
                {forestError}
              </Typography>
            )}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 3,
              }}
            >
              <Button
                onClick={handleCloseCreateForest}
                sx={{ color: "#6B8B5A" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateForest}
                sx={{
                  bgcolor: "#4A6741",
                  "&:hover": { bgcolor: "#6B8B5A" },
                }}
              >
                Create Forest
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
}
