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
  const validation = validators.signup(req.body);
  if (!validation) {
    return res.status(400).json({
      error: "Invalid input",
      details: validators.signup.errors?.map(
        e => `${(e as any).instancePath || (e as any).schemaPath}: ${e.message}`
      ),
    });
  }

  const { email, password, name, avatar } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(
    `🚀🤗 ~ handler ~ email, password, name, avatar:`,
    email,
    password,
    name,
    avatar
  );

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar: avatar || "monkey",
      },
    });
    const token = generateToken(user.id);
    res.setHeader(
      "Set-Cookie",
      `authToken=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`
    ); // 1 hour, secure cookie
    res.status(201).json({ token, user: { id: user.id, email, name } });
  } catch (error) {
    console.error("Signup error:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(400).json({ error: "Email or display name already exists" });
    } else {
      handleApiError(error, res);
    }
  }
}
