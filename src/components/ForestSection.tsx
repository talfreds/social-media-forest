import React from "react";
import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";
import { Forest, Nature, Park } from "@mui/icons-material";

export type ForestType =
  | "deep-woods"
  | "misty-grove"
  | "autumn-forest"
  | "pine-forest"
  | "oak-grove";

interface ForestSectionProps {
  type: ForestType;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
}

const ForestSection: React.FC<ForestSectionProps> = ({
  type,
  title,
  description,
  isActive = false,
  onClick,
}) => {
  const theme = useTheme();

  const forestStyles = {
    "deep-woods": {
      background: `
        linear-gradient(135deg,
          #0F1A0F 0%,
          #1A2D1A 25%,
          #0F1A0F 50%,
          #1A2D1A 75%,
          #0F1A0F 100%
        ),
        radial-gradient(ellipse at 20% 50%, rgba(74, 103, 65, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(107, 139, 90, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 40% 80%, rgba(46, 74, 38, 0.4) 0%, transparent 50%)
      `,
      icon: Forest,
      primaryColor: "#4A6741",
      accentColor: "#66BB6A",
    },
    "misty-grove": {
      background: `
        linear-gradient(135deg,
          #1A2D1A 0%,
          #2E4A2E 25%,
          #1A2D1A 50%,
          #2E4A2E 75%,
          #1A2D1A 100%
        ),
        radial-gradient(ellipse at 30% 30%, rgba(184, 212, 184, 0.2) 0%, transparent 60%),
        radial-gradient(ellipse at 70% 70%, rgba(139, 105, 20, 0.15) 0%, transparent 60%)
      `,
      icon: Nature,
      primaryColor: "#6B8B5A",
      accentColor: "#B8D4B8",
    },
    "autumn-forest": {
      background: `
        linear-gradient(135deg,
          #2E4A2E 0%,
          #4A6741 25%,
          #2E4A2E 50%,
          #6B4F11 75%,
          #2E4A2E 100%
        ),
        radial-gradient(ellipse at 25% 25%, rgba(255, 167, 38, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 75% 75%, rgba(139, 69, 19, 0.15) 0%, transparent 50%)
      `,
      icon: Park,
      primaryColor: "#8B6914",
      accentColor: "#FFA726",
    },
    "pine-forest": {
      background: `
        linear-gradient(135deg,
          #1A2D1A 0%,
          #2E4A2E 30%,
          #1A2D1A 60%,
          #0F1A0F 100%
        ),
        radial-gradient(ellipse at 50% 20%, rgba(46, 125, 50, 0.3) 0%, transparent 60%),
        radial-gradient(ellipse at 20% 80%, rgba(76, 175, 80, 0.2) 0%, transparent 50%)
      `,
      icon: Forest,
      primaryColor: "#2E7D32",
      accentColor: "#4CAF50",
    },
    "oak-grove": {
      background: `
        linear-gradient(135deg,
          #2E4A2E 0%,
          #4A6741 20%,
          #2E4A2E 40%,
          #6B4F11 60%,
          #2E4A2E 80%,
          #4A6741 100%
        ),
        radial-gradient(ellipse at 30% 30%, rgba(139, 105, 20, 0.25) 0%, transparent 60%),
        radial-gradient(ellipse at 70% 70%, rgba(160, 139, 91, 0.2) 0%, transparent 50%)
      `,
      icon: Nature,
      primaryColor: "#8B6914",
      accentColor: "#A68B5B",
    },
  };

  const style = forestStyles[type];
  const Icon = style.icon;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        background: style.background,
        border: `2px solid ${
          isActive ? style.accentColor : style.primaryColor
        }`,
        borderRadius: "16px",
        transition: "all 0.3s ease-in-out",
        transform: isActive ? "scale(1.02)" : "scale(1)",
        boxShadow: isActive
          ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px ${style.accentColor}33`
          : "0 4px 20px rgba(0, 0, 0, 0.3)",
        "&:hover": onClick
          ? {
              transform: "scale(1.05)",
              boxShadow: `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${style.accentColor}44`,
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        <Icon
          sx={{
            fontSize: 48,
            color: style.accentColor,
            mb: 2,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />

        <Typography
          variant="h5"
          sx={{
            color: "#E8F5E8",
            mb: 1,
            fontWeight: 700,
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#B8D4B8",
            lineHeight: 1.5,
            maxWidth: "280px",
            mx: "auto",
          }}
        >
          {description}
        </Typography>

        {isActive && (
          <Box
            sx={{
              mt: 2,
              width: 40,
              height: 3,
              backgroundColor: style.accentColor,
              borderRadius: "2px",
              mx: "auto",
              boxShadow: `0 0 8px ${style.accentColor}66`,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ForestSection;
