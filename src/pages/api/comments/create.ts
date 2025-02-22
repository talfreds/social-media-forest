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

    const { content, postId } = req.body;

    const comment = await prisma.comment.create({
      data: { content, authorId: userId, postId: Number(postId) },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
