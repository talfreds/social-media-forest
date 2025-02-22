import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`🚀🤗 ~ handler ~ email, password, name:`, email, password, name);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    const token = generateToken(user.id);
    res.setHeader(
      "Set-Cookie",
      `authToken=${token}; HttpOnly; Path=/; Max-Age=3600`
    ); // 1 hour
    res.status(201).json({ token, user: { id: user.id, email, name } });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
}
