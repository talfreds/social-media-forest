import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { requireAuth, setSecurityHeaders } from "../../../lib/security";
import { validators } from "../../../lib/validation";
import { handleApiError } from "../../../lib/error-handler";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  setSecurityHeaders(res);

  requireAuth(req, res, async () => {
    try {
      const validation = validators.forest(req.body);
      if (!validation) {
        return res.status(400).json({
          error: "Invalid input",
          details: validators.forest.errors?.map(
            e =>
              `${(e as any).instancePath || (e as any).schemaPath}: ${
                e.message
              }`
          ),
        });
      }

      const { name, description, isPrivate } = req.body;
      const userId = (req as any).user.userId;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Forest name is required" });
      }

      const forest = await prisma.forest.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          isPrivate: isPrivate === true,
          creatorId: userId,
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
      handleApiError(error, res);
    }
  });
}
