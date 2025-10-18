import { createMocks } from "node-mocks-http";
import createHandler from "../../pages/api/comments/create";
import deleteHandler from "../../pages/api/comments/delete";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../lib/auth";

const prisma = new PrismaClient();

describe("Comments API", () => {
  let userId: string;
  let postId: string;
  let commentId: string;
  let token: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: "commenttest@example.com",
        password: "password",
        name: "CommentTestUser",
      },
    });
    userId = user.id;
    token = generateToken(userId);

    // Create test post
    const post = await prisma.post.create({
      data: {
        content: "Test post for comments",
        authorId: userId,
      },
    });
    postId = post.id;
  });

  afterAll(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany({
      where: { email: "commenttest@example.com" },
    });
    await prisma.$disconnect();
  });

  describe("/api/comments/create", () => {
    it("should create a comment", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          cookie: `authToken=${token}`,
        },
        body: {
          content: "Test comment",
          postId,
        },
      });

      await createHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.content).toBe("Test comment");
      expect(data.authorId).toBe(userId);
      commentId = data.id;
    });
  });

  describe("/api/comments/delete", () => {
    it("should soft delete a comment", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          cookie: `authToken=${token}`,
        },
        query: {
          commentId,
        },
      });

      await deleteHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);

      // Verify comment is soft deleted
      const deletedComment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      expect(deletedComment?.deletedAt).toBeDefined();
    });

    it("should reject deleting comment by different user", async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: "other@example.com",
          password: "password",
          name: "OtherUser",
        },
      });
      const otherToken = generateToken(otherUser.id);

      // Create comment by other user
      const otherComment = await prisma.comment.create({
        data: {
          content: "Other user comment",
          authorId: otherUser.id,
          postId,
        },
      });

      const { req, res } = createMocks({
        method: "DELETE",
        headers: {
          cookie: `authToken=${token}`, // Using original user's token
        },
        query: {
          commentId: otherComment.id,
        },
      });

      await deleteHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Not authorized");

      // Cleanup
      await prisma.comment.delete({ where: { id: otherComment.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
