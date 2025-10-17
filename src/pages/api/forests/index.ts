import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const forests = await prisma.forest.findMany({
      include: {
        creator: { select: { name: true } },
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(forests);
  } catch (error) {
    console.error("Error fetching forests:", error);
    res.status(500).json({ error: "Failed to fetch forests" });
  }
}
