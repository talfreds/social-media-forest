import { createMocks } from "node-mocks-http";
import sendHandler from "../../pages/api/friends/send";
import respondHandler from "../../pages/api/friends/respond";
import listHandler from "../../pages/api/friends/list";
import { generateToken } from "../../lib/auth";
import { prisma, setupTestDatabase, cleanupTestDatabase } from "../test-utils";

describe("Friend System API", () => {
  let user1Id: string;
  let user2Id: string;
  let user1Token: string;
  let user2Token: string;

  beforeAll(async () => {
    // Connect to test database and clean any existing data
    await setupTestDatabase();

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: "friend1@test.com",
        password: "password",
        name: "FriendUser1",
      },
    });
    user1Id = user1.id;
    user1Token = generateToken(user1Id);

    const user2 = await prisma.user.create({
      data: {
        email: "friend2@test.com",
        password: "password",
        name: "FriendUser2",
      },
    });
    user2Id = user2.id;
    user2Token = generateToken(user2Id);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await prisma.$disconnect();
  });

  describe("/api/friends/send", () => {
    it("should send a friend request", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          cookie: `authToken=${user1Token}`,
        },
        body: {
          receiverName: "FriendUser2",
        },
      });

      await sendHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe("PENDING");
      expect(data.receiver.name).toBe("FriendUser2");
    });

    it("should reject duplicate friend request", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          cookie: `authToken=${user1Token}`,
        },
        body: {
          receiverName: "FriendUser2",
        },
      });

      await sendHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("already sent");
    });

    it("should reject friend request to self", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          cookie: `authToken=${user1Token}`,
        },
        body: {
          receiverName: "FriendUser1",
        },
      });

      await sendHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("yourself");
    });
  });

  describe("/api/friends/respond", () => {
    let requestId: string;

    beforeAll(async () => {
      // Find the friend request created by the send test
      const request = await prisma.friend.findFirst({
        where: {
          initiatorId: user1Id,
          receiverId: user2Id,
          status: "PENDING",
        },
      });

      if (!request) {
        throw new Error("Friend request not found - send test must run first");
      }

      requestId = request.id;
    });

    it("should accept a friend request", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          cookie: `authToken=${user2Token}`,
        },
        body: {
          requestId,
          action: "accept",
        },
      });

      await respondHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe("ACCEPTED");
    });

    it("should reject responding to already accepted request", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          cookie: `authToken=${user2Token}`,
        },
        body: {
          requestId,
          action: "reject",
        },
      });

      await respondHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("already responded");
    });
  });

  describe("/api/friends/list", () => {
    it("should list friends for user", async () => {
      // The friend request should already be accepted from the previous tests
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          cookie: `authToken=${user1Token}`,
        },
      });

      await listHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.friends).toHaveLength(1);
      expect(data.friends[0].friend.name).toBe("FriendUser2");
    });
  });
});
