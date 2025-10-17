import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../lib/auth";
import { parse } from "cookie";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decoded.userId;

    const { content, postId, parentId } = req.body;

    // Validate postId
    if (!postId || typeof postId !== "string" || postId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // Validate parentId if provided
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
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error("Comment creation error:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
}
