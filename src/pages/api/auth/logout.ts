// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // Clear the authToken cookie by setting it to expire immediately
  res.setHeader(
    "Set-Cookie",
    "authToken=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
  );
  res.status(200).json({ message: "Logged out successfully" });
}
