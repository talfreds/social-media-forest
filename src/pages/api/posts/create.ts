import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import {
  postRateLimit,
  setSecurityHeaders,
  requireAuth,
} from "../../../lib/security";
import { validators } from "../../../lib/validation";
import { handleApiError } from "../../../lib/error-handler";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  setSecurityHeaders(res);

  if (!postRateLimit(req, res)) {
    return;
  }

  requireAuth(req, res, async () => {
    const validation = validators.post(req.body);
    if (!validation) {
      return res.status(400).json({
        error: "Invalid input",
        details: validators.post.errors?.map(
          e =>
            `${(e as any).instancePath || (e as any).schemaPath}: ${e.message}`
        ),
      });
    }

    const { content, location, forestId, imageUrl } = req.body;
    const userId = (req as any).user.userId;

    try {
      const post = await prisma.post.create({
        data: {
          content,
          location, // { lat, lon }
          authorId: userId,
          forestId: forestId || null,
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
      res.status(201).json(post);
    } catch (error) {
      console.error("Post creation error:", error);
      handleApiError(error, res);
    }
  });
}
