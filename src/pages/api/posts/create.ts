import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";
import { postRateLimit, setSecurityHeaders } from "../../../lib/security";
import { validators } from "../../../lib/validation";
import { handleApiError } from "../../../lib/error-handler";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // Apply security headers
  setSecurityHeaders(res);

  // Apply rate limiting
  if (!postRateLimit(req, res)) {
    return; // Rate limit exceeded
  }

  const token = req.cookies.authToken;
  const user = token ? verifyToken(token) : null;
  console.log(`🚀🤗 ~ user:`, user);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // Validate input
  const validation = validators.post(req.body);
  if (!validation) {
    return res.status(400).json({
      error: "Invalid input",
      details: validators.post.errors?.map(
        (e) =>
          `${(e as any).instancePath || (e as any).schemaPath}: ${e.message}`
      ),
    });
  }

  const { content, location, forestId, imageUrl } = req.body;
  try {
    const post = await prisma.post.create({
      data: {
        content,
        location, // { lat, lon }
        authorId: user.userId,
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
}
