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

    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Forest name is required" });
    }

    const forest = await prisma.forest.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        creatorId: decoded.userId,
      },
    });

    res.status(201).json(forest);
  } catch (error: any) {
    console.error("Forest creation error:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "A forest with this name already exists" });
    }
    res.status(500).json({ error: "Failed to create forest" });
  }
}
