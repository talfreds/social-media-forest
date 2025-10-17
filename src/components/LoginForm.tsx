// components/LoginForm.tsx
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginForm({ isVisible }: { isVisible: boolean }) {
  const [data, setData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (res.ok) {
        window.location.reload();
      } else {
        const errorMsg =
          responseData.error || "An unexpected error occurred during login";
        setErrorMessage(errorMsg);
        console.error("Login failed:", responseData);
      }
    } catch (error) {
      setErrorMessage(
        "Failed to connect to the server. Please try again later."
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Fade in={isVisible}>
      <Paper
        onKeyDown={(e) => {
          if (e.key === "Tab") e.stopPropagation();
        }}
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 400,
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
          {/* Error Message - Removed redundant message since fields show the error */}

          {/* Email Field */}
          <TextField
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            fullWidth
            variant="outlined"
            size="medium"
            error={!!errorMessage}
            helperText={errorMessage || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "&:hover fieldset": {
                  borderColor: "secondary.main",
                },
              },
            }}
          />

          {/* Password Field with Visibility Toggle */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            fullWidth
            variant="outlined"
            size="medium"
            error={!!errorMessage}
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
                  borderColor: "secondary.main",
                },
              },
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "secondary.dark",
                transform: "translateY(-2px)",
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            {isLoading ? "Logging In..." : "Log In"}
          </Button>
        </Box>
      </Paper>
    </Fade>
  );
}
