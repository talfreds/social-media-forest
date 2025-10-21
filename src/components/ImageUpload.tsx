import { Close, PhotoCamera } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useRef, useState } from "react";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  currentImage?: string | null;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSizeMB = 2,
}: ImageUploadProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, GIF, or WebP image");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(
        `Image too large. Maximum size is ${maxSizeMB}MB. Your image is ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
      return;
    }

    setUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async event => {
        const base64Data = event.target?.result as string;

        try {
          // Send to upload API for validation
          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageData: base64Data,
              mimeType: file.type,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to upload image");
          }

          const data = await response.json();
          onImageUpload(data.imageUrl);
          setUploading(false);
        } catch (err) {
          console.error("Image upload error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to upload image"
          );
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read image file");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File read error:", err);
      setError("Failed to process image");
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {currentImage ? (
        <Box
          sx={{
            position: "relative",
            maxWidth: "300px",
            borderRadius: 2,
            overflow: "hidden",
            border: `2px solid ${isDark ? "#4A6741" : "#2E7D32"}`,
            mx: "auto", // Center horizontally
          }}
        >
          {/* TODO: Replace with Next.js Image component for better performance */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Uploaded preview"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
          <IconButton
            onClick={handleRemoveImage}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
            }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={
            uploading ? <CircularProgress size={16} /> : <PhotoCamera />
          }
          onClick={handleButtonClick}
          disabled={uploading}
          sx={{
            color: isDark ? "#B8D4B8" : "#2E7D32",
            borderColor: isDark ? "#4A6741" : "#2E7D32",
            "&:hover": {
              borderColor: isDark ? "#B8D4B8" : "#1B5E20",
              backgroundColor: isDark
                ? "rgba(184, 212, 184, 0.1)"
                : "rgba(46, 125, 50, 0.1)",
            },
          }}
        >
          {uploading ? "Uploading..." : "Add Image"}
        </Button>
      )}
    </Box>
  );
}
