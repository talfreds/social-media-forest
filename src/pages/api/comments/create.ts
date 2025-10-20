import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  commentRateLimit,
  setSecurityHeaders,
  requireAuth,
} from "../../../lib/security";
import { validators } from "../../../lib/validation";
import { handleApiError } from "../../../lib/error-handler";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  setSecurityHeaders(res);

  if (!commentRateLimit(req, res)) {
    return;
  }

  await requireAuth(req, res, async () => {
    try {
      const userId = (req as any).user.userId;

      const validation = validators.comment(req.body);
      if (!validation) {
        return res.status(400).json({
          error: "Invalid input",
          details: validators.comment.errors?.map(
            e =>
              `${(e as any).instancePath || (e as any).schemaPath}: ${
                e.message
              }`
          ),
        });
      }

      const { content, postId, parentId, imageUrl } = req.body;

      if (!postId || typeof postId !== "string" || postId.trim().length === 0) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      if (
        parentId &&
        (typeof parentId !== "string" || parentId.trim().length === 0)
      ) {
        return res.status(400).json({ error: "Invalid parent comment ID" });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: userId,
          postId: postId,
          parentId: parentId || null,
          imageUrl: imageUrl || null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Comment creation error:", error);
      handleApiError(error, res);
    }
  });
}
