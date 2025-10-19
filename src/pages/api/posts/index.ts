import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { setSecurityHeaders } from "../../../lib/security";
import { handleApiError } from "../../../lib/error-handler";

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
        author: { select: { name: true } },
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
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Posts fetch error:", error);
    handleApiError(error, res);
  }
}
