// components/LogoutButton.tsx
import { Button } from "@mui/material";

export default function LogoutButton() {
  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      window.location.href = "/";
    } else {
      console.error("Logout failed");
    }
  };

  return (
    <Button
      variant="outlined"
      color="secondary"
      onClick={handleLogout}
      size="medium"
      sx={{ minWidth: { xs: "80px", sm: "100px" } }} // Match button sizes
    >
      Logout
    </Button>
  );
}
