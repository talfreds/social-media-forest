import { Forest, Home } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";

export default function Custom404() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0F1A0F 0%, #1A2D1A 50%, #0F1A0F 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <Forest sx={{ fontSize: 120, color: "#4A6741", mb: 3 }} />
          <Typography
            variant="h1"
            sx={{
              color: "#E8F5E8",
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "3rem", sm: "4rem" },
            }}
          >
            404
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#B8D4B8",
              mb: 4,
            }}
          >
            Lost in the woods?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#B8D4B8",
              mb: 4,
            }}
          >
            This path doesn&apos;t lead anywhere in our forest.
          </Typography>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              startIcon={<Home />}
              sx={{
                bgcolor: "#4A6741",
                "&:hover": { bgcolor: "#6B8B5A" },
                px: 4,
                py: 1.5,
              }}
            >
              Return to Forest
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
