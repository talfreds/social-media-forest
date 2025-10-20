// components/RegisterForm.tsx
import { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Fade,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Grid,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Pets,
  BugReport,
  Forest,
  AcUnit,
  Water,
} from "@mui/icons-material";

const avatarOptions = [
  { value: "cat", label: "Cat", icon: Pets },
  { value: "dog", label: "Dog", icon: BugReport },
  { value: "fish", label: "Fish", icon: Water },
  { value: "lizard", label: "Lizard", icon: AcUnit },
  { value: "monkey", label: "Monkey", icon: Forest },
];

export default function RegisterForm({
  isVisible,
  onSwitchToLogin,
}: {
  isVisible: boolean;
  onSwitchToLogin?: () => void;
}) {
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    avatar: "monkey",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    name: false,
  });

  // Validation functions
  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/\d/.test(password)) errors.push("one number");
    return errors;
  };

  const validateName = (name: string) => {
    const errors = [];
    if (name.length < 2) errors.push("at least 2 characters");
    if (name.length > 50) errors.push("max 50 characters");
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(name))
      errors.push("only letters, numbers, spaces, _ and -");
    return errors;
  };

  const validateEmail = (email: string) => {
    if (!email) return ["required"];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return ["valid email format"];
    return [];
  };

  // Generate suggested display name from email
  const generateDisplayName = (email: string) => {
    if (!email) return "";
    const username = email.split("@")[0];
    // Clean up the username and make it display-name friendly
    return username
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/^[0-9]/, "") // Remove leading numbers
      .substring(0, 20) // Limit length
      .toLowerCase();
  };

  // Handle email change and auto-fill display name
  const handleEmailChange = (email: string) => {
    setData(prev => ({
      ...prev,
      email,
      // Auto-fill display name if it's empty or was previously auto-generated
      name:
        prev.name === "" || prev.name === generateDisplayName(prev.email)
          ? generateDisplayName(email)
          : prev.name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (res.ok) {
        window.location.reload();
      } else {
        const errorMsg =
          responseData.error || "An unexpected error occurred during signup";
        setErrorMessage(errorMsg);
        console.error("Signup failed:", responseData);
      }
    } catch (error) {
      setErrorMessage(
        "Failed to connect to the server. Please try again later."
      );
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Fade in={isVisible}>
      <Paper
        onKeyDown={e => {
          if (e.key === "Tab") e.stopPropagation();
        }}
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: "100%",
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          bgcolor: "background.paper",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Error Message */}
          {errorMessage && (
            <Typography
              variant="body2"
              sx={{
                bgcolor: "error.light",
                color: "error.contrastText",
                p: 1,
                borderRadius: 1,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {errorMessage}
            </Typography>
          )}

          {/* Email Field */}
          <TextField
            label="Email"
            type="email"
            value={data.email}
            onChange={e => handleEmailChange(e.target.value)}
            onBlur={() => setTouched({ ...touched, email: true })}
            fullWidth
            variant="outlined"
            size="medium"
            required
            error={touched.email && validateEmail(data.email).length > 0}
            helperText={
              touched.email && validateEmail(data.email).length > 0
                ? `Needs: ${validateEmail(data.email).join(", ")}`
                : "We'll never share your email"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiFormHelperText-root": {
                whiteSpace: "normal",
                wordWrap: "break-word",
              },
            }}
          />

          {/* Password Field with Visibility Toggle */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={data.password}
            onChange={e => setData({ ...data, password: e.target.value })}
            onBlur={() => setTouched({ ...touched, password: true })}
            fullWidth
            variant="outlined"
            size="medium"
            required
            error={
              touched.password && validatePassword(data.password).length > 0
            }
            helperText={
              touched.password && validatePassword(data.password).length > 0
                ? `Needs: ${validatePassword(data.password).join(", ")}`
                : "Must include: 8+ characters, uppercase, lowercase, and number"
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiFormHelperText-root": {
                whiteSpace: "normal",
                wordWrap: "break-word",
              },
            }}
          />

          {/* Display Name Field */}
          <TextField
            label="Display Name"
            type="text"
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            onBlur={() => setTouched({ ...touched, name: true })}
            fullWidth
            variant="outlined"
            size="medium"
            required
            error={touched.name && validateName(data.name).length > 0}
            placeholder="How you'll appear to others"
            helperText={
              touched.name && validateName(data.name).length > 0
                ? `Needs: ${validateName(data.name).join(", ")}`
                : data.email && data.name === generateDisplayName(data.email)
                ? "Auto-filled from your email (you can change this)"
                : "2-50 characters: letters, numbers, spaces, _ and -"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiFormHelperText-root": {
                whiteSpace: "normal",
                wordWrap: "break-word",
                lineHeight: 1.3,
              },
            }}
          />

          {/* Avatar Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Choose Your Avatar
            </Typography>
            <Grid container spacing={1}>
              {avatarOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <Grid item xs={2.4} key={option.value}>
                    <Box
                      onClick={() => setData({ ...data, avatar: option.value })}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: 1,
                        borderRadius: 1,
                        cursor: "pointer",
                        border:
                          data.avatar === option.value
                            ? "2px solid"
                            : "2px solid transparent",
                        borderColor:
                          data.avatar === option.value
                            ? "primary.main"
                            : "transparent",
                        backgroundColor:
                          data.avatar === option.value
                            ? "primary.light"
                            : "transparent",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            data.avatar === option.value
                              ? "primary.main"
                              : "grey.400",
                          width: 32,
                          height: 32,
                          mb: 0.5,
                        }}
                      >
                        <IconComponent fontSize="small" />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                        {option.label}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translateY(-2px)",
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>

          {/* Switch to Login */}
          {onSwitchToLogin && (
            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                Already have an account?
              </Typography>
              <Button
                variant="text"
                color="primary"
                onClick={onSwitchToLogin}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                  },
                }}
              >
                Sign In Instead
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Fade>
  );
}
