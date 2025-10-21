import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

// Helper function to get JWT secret with runtime validation
function getJwtSecret(): string {
  if (!SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return SECRET;
}

export function generateToken(userId: string): string {
  const jwtSecret = getJwtSecret();
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "1h" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}
