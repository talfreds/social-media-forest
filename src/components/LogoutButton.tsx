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
      onClick={handleLogout}
      size="medium"
      sx={{
        minWidth: { xs: "80px", sm: "100px" },
        borderColor: "#E8F5E8",
        color: "#E8F5E8",
        "&:hover": {
          borderColor: "#E8F5E8",
          backgroundColor: "rgba(232, 245, 232, 0.1)",
        },
      }}
    >
      Logout
    </Button>
  );
}
