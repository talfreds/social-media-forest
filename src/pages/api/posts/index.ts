import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { setSecurityHeaders } from "../../../lib/security";
import { handleApiError } from "../../../lib/error-handler";
import { sortByActivityAndAge } from "../../../lib/sorting";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  setSecurityHeaders(res);

  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          where: { deletedAt: null },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            replies: {
              where: { deletedAt: null },
              include: {
                author: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    // Sort posts using centralized sorting logic (same as forests)
    const sortedPosts = sortByActivityAndAge(posts);
    res.status(200).json(sortedPosts);
  } catch (error) {
    console.error("Posts fetch error:", error);
    handleApiError(error, res);
  }
}
