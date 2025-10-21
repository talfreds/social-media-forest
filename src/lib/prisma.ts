// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Extend the global scope to store PrismaClient (TypeScript-friendly)
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize the singleton Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    // Optional: Tune connection pool if needed (default is fine for most cases)
    // datasourceUrl: process.env.DATABASE_URL, // Already set in schema.prisma
  });
};

// Use the global singleton if it exists, otherwise create it
export const prisma: PrismaClient =
  globalThis.prisma ?? prismaClientSingleton();

// In development, attach to globalThis to persist across hot reloads
if (process.env.NODE_ENV === "development") {
  globalThis.prisma = prisma;
}

export default prisma;
