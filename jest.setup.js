// Learn more: https://github.com/testing-library/jest-dom
require("@testing-library/jest-dom");

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
