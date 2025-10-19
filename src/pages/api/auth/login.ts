import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../lib/auth";
import { authRateLimit, setSecurityHeaders } from "../../../lib/security";
import { validators } from "../../../lib/validation";
import { handleApiError } from "../../../lib/error-handler";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  setSecurityHeaders(res);

  if (!authRateLimit(req, res)) {
    return;
  }

  // Validate input
  const validation = validators.login(req.body);
  if (!validation) {
    return res.status(400).json({
      error: "Invalid input",
      details: validators.login.errors?.map(
        e => `${(e as any).instancePath || (e as any).schemaPath}: ${e.message}`
      ),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `authToken=${token}; HttpOnly; ${
        isProd ? "Secure; " : ""
      }SameSite=Strict; Path=/; Max-Age=3600`
    );

    res
      .status(200)
      .json({ token, user: { id: user.id, email, name: user.name } });
  } catch (error) {
    console.error("Login error:", error);
    handleApiError(error, res);
  }
}
