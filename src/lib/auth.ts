import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret-key"; // Set this in .env

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    return null;
  }
}
