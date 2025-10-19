import type { NextApiRequest, NextApiResponse } from "next";
import {
  requireAuth,
  setSecurityHeaders,
  uploadRateLimit,
} from "../../lib/security";
import { validators } from "../../lib/validation";
import { handleApiError } from "../../lib/error-handler";

/**
 * Stores images as base64 data URLs in the database
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

  setSecurityHeaders(res);

  if (!uploadRateLimit(req, res)) {
    return;
  }

  requireAuth(req, res, async () => {
    try {
      const validation = validators.imageUpload(req.body);
      if (!validation) {
        return res.status(400).json({
          error: "Invalid input",
          details: validators.imageUpload.errors?.map(
            e =>
              `${(e as any).instancePath || (e as any).schemaPath}: ${
                e.message
              }`
          ),
        });
      }

      const { imageData, mimeType } = req.body;

      if (!imageData || !mimeType) {
        return res
          .status(400)
          .json({ error: "Missing image data or MIME type" });
      }

      // Validate MIME type
      if (!ALLOWED_TYPES.includes(mimeType)) {
        return res.status(400).json({
          error: "Unsupported image format. Use JPEG, PNG, GIF, or WebP",
        });
      }

      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

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

      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return res.status(200).json({
        success: true,
        imageUrl: dataUrl,
        size: sizeInBytes,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      handleApiError(error, res);
    }
  });
}
