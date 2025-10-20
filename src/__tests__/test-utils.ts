import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

// Use test database URL for Prisma client
const testDbUrl = "postgresql://test:test@localhost:5433/test_db";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
});

export async function setupTestDatabase() {
  try {
    console.log("Setting up test database...");
    // Test database is already set up with migrations
    await prisma.$connect();
    // Clean up any leftover data from previous test runs
    await cleanupTestDatabase();
    console.log("Test database setup complete");
  } catch (error) {
    console.error("Failed to setup test database:", error);
    throw error;
  }
}

export async function cleanupTestDatabase() {
  try {
    // Clean up all test data in correct order (respecting foreign keys)
    await prisma.comment.deleteMany(); // Delete comments first (references posts)
    await prisma.post.deleteMany(); // Delete posts (references users and forests)
    await prisma.friend.deleteMany(); // Delete friends (references users)
    await prisma.forest.deleteMany(); // Delete forests (references users)
    await prisma.user.deleteMany(); // Delete users last
  } catch (error) {
    console.error("Failed to cleanup test database:", error);
  }
}

export { prisma };
