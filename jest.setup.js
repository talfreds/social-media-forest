// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key";
// Use environment DATABASE_URL if available (for CI), otherwise default to local test DB
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5433/test_db";
