import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

/**
 * Simple image upload handler for free tier
 * Stores images as base64 data URLs in the database
 *
 * Limits (to stay within free tier):
 * - Max file size: 2MB per image
 * - Max images per user: 50
 * - Supported formats: JPEG, PNG, GIF, WebP
 */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb", // Slightly higher to account for base64 encoding
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify authentication
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { imageData, mimeType } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ error: "Missing image data or MIME type" });
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: "Unsupported image format. Use JPEG, PNG, GIF, or WebP",
      });
    }

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

    // Validate size (base64 is ~33% larger than original)
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `Image too large. Maximum size is 2MB. Your image is ${(
          sizeInBytes /
          1024 /
          1024
        ).toFixed(2)}MB`,
      });
    }

    // Return the data URL for storage
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return res.status(200).json({
      success: true,
      imageUrl: dataUrl,
      size: sizeInBytes,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({ error: "Failed to process image" });
  }
}
