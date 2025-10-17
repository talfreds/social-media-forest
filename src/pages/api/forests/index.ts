import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../lib/auth";
import { parse } from "cookie";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.authToken;
    const decoded = token ? verifyToken(token) : null;
    const currentUserId = decoded?.userId;

    // Get all forests
    const allForests = await prisma.forest.findMany({
      include: {
        creator: { select: { name: true, id: true } },
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // If user is not logged in, only show public forests
    if (!currentUserId) {
      const publicForests = allForests.filter((forest) => !forest.isPrivate);
      return res.status(200).json(publicForests);
    }

    // Get user's friends
    const friendships = await prisma.friend.findMany({
      where: {
        AND: [
          {
            OR: [{ initiatorId: currentUserId }, { receiverId: currentUserId }],
          },
          { status: "ACCEPTED" },
        ],
      },
      select: {
        initiatorId: true,
        receiverId: true,
      },
    });

    // Extract friend IDs
    const friendIds = friendships.map((f) =>
      f.initiatorId === currentUserId ? f.receiverId : f.initiatorId
    );

    // Filter forests based on access
    const accessibleForests = allForests.filter((forest) => {
      // Public forests are visible to everyone
      if (!forest.isPrivate) return true;

      // User can see their own private forests
      if (forest.creator.id === currentUserId) return true;

      // User can see private forests created by their friends
      if (friendIds.includes(forest.creator.id)) return true;

      return false;
    });

    res.status(200).json(accessibleForests);
  } catch (error) {
    console.error("Error fetching forests:", error);
    res.status(500).json({ error: "Failed to fetch forests" });
  }
}
