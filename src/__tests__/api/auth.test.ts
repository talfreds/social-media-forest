import { createMocks } from "node-mocks-http";
import signupHandler from "../../pages/api/auth/signup";
import loginHandler from "../../pages/api/auth/login";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

describe("/api/auth/signup", () => {
  beforeAll(async () => {
    // Clean up test database
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new user with unique display name", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "test@example.com",
        password: "password123",
        name: "TestUser123",
      },
    });

    await signupHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.user.email).toBe("test@example.com");
    expect(data.user.name).toBe("TestUser123");
    expect(data.token).toBeDefined();
  });

  it("should reject duplicate display name", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "test2@example.com",
        password: "password123",
        name: "TestUser123", // Duplicate name
      },
    });

    await signupHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain("Display name already taken");
  });

  it("should reject duplicate email", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "test@example.com", // Duplicate email
        password: "password123",
        name: "DifferentUser",
      },
    });

    await signupHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain("email");
  });
});

describe("/api/auth/login", () => {
  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    await prisma.user.upsert({
      where: { email: "login@example.com" },
      update: {},
      create: {
        email: "login@example.com",
        password: hashedPassword,
        name: "LoginTestUser",
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: "login@example.com" } });
    await prisma.$disconnect();
  });

  it("should login with valid credentials", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "login@example.com",
        password: "testpassword",
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe("login@example.com");
  });

  it("should reject invalid credentials", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "login@example.com",
        password: "wrongpassword",
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain("Invalid credentials");
  });
});
