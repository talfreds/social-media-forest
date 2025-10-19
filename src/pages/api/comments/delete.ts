import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  requireAuth,
  setSecurityHeaders,
  deleteRateLimit,
} from "../../../lib/security";
import { handleApiError } from "../../../lib/error-handler";

// Soft delete implementation for comments

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  setSecurityHeaders(res);

  if (!deleteRateLimit(req, res)) {
    return;
  }
  requireAuth(req, res, async () => {
    try {
      const { commentId } = req.query;
      const userId = (req as any).user.userId;

      if (!commentId || typeof commentId !== "string") {
        return res.status(400).json({ error: "Comment ID is required" });
      }

      // Check if the comment exists and belongs to the user
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, authorId: true },
      });

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (comment.authorId !== userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this comment" });
      }

      // Soft delete the comment by setting deletedAt timestamp
      await prisma.comment.update({
        where: { id: commentId },
        data: { deletedAt: new Date() },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Delete comment error:", error);
      handleApiError(error, res);
    }
  });
}
