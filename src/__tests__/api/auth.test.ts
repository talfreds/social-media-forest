import { createMocks } from "node-mocks-http";
import signupHandler from "../../pages/api/auth/signup";
import loginHandler from "../../pages/api/auth/login";
import bcrypt from "bcryptjs";
import { prisma, setupTestDatabase, cleanupTestDatabase } from "../test-utils";

describe("/api/auth/signup", () => {
  beforeAll(async () => {
    // Connect to test database and clean any existing data
    await prisma.$connect();
    await cleanupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  it("should create a new user with unique display name", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "test@example.com",
        password: "Password123",
        name: "TestUser123",
      },
    });

    await signupHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.user.email).toBe("test@example.com");
    expect(data.user.name).toBe("TestUser123");
    expect(data.token).toBeDefined();
  });

  it("should reject duplicate display name", async () => {
    // First create a user
    const { req: req1, res: res1 } = createMocks({
      method: "POST",
      body: {
        email: "dupname1@example.com",
        password: "Password123",
        name: "DupNameUser",
      },
    });
    await signupHandler(req1, res1);

    // Then try to create another user with same name
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "dupname2@example.com",
        password: "Password123",
        name: "DupNameUser", // Duplicate name
      },
    });

    await signupHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain("Display name already taken");
  });

  it("should reject duplicate email", async () => {
    // First create a user
    const { req: req1, res: res1 } = createMocks({
      method: "POST",
      body: {
        email: "dupemail@example.com",
        password: "Password123",
        name: "DupEmailUser1",
      },
    });
    await signupHandler(req1, res1);

    // Then try to create another user with same email
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "dupemail@example.com", // Duplicate email
        password: "Password123",
        name: "DupEmailUser2",
      },
    });

    await signupHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain("Email already exists");
  });
});

describe("/api/auth/login", () => {
  beforeAll(async () => {
    // Don't clean database - signup tests need their users
    // Just create test user for login tests
    const hashedPassword = await bcrypt.hash("TestPassword123", 10);
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
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  it("should login with valid credentials", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "login@example.com",
        password: "TestPassword123",
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
        password: "WrongPassword123",
      },
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.error).toContain("Invalid credentials");
  });
});
