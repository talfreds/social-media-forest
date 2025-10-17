import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const token = req.cookies.authToken;
  const user = token ? verifyToken(token) : null;
  console.log(`🚀🤗 ~ user:`, user);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { content, location, forestId } = req.body;
  try {
    const post = await prisma.post.create({
      data: {
        content,
        location, // { lat, lon }
        authorId: user.userId,
        forestId: forestId ? Number(forestId) : null,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
}
