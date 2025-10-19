import type { NextApiRequest, NextApiResponse } from "next";
import { setSecurityHeaders } from "../../../lib/security";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  setSecurityHeaders(res);

  // Clear the authToken cookie by setting it to expire immediately
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `authToken=; Path=/; Max-Age=0; HttpOnly; ${
      isProd ? "Secure; " : ""
    }SameSite=Strict`
  );
  res.status(200).json({ message: "Logged out successfully" });
}
