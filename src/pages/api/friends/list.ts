import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth, setSecurityHeaders } from "../../../lib/security";
import { handleApiError } from "../../../lib/error-handler";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  setSecurityHeaders(res);

  requireAuth(req, res, async () => {
    try {
      const userId = (req as any).user.userId;
      // Get all accepted friendships
      const friends = await prisma.friend.findMany({
        where: {
          AND: [
            {
              OR: [{ initiatorId: userId }, { receiverId: userId }],
            },
            { status: "ACCEPTED" },
          ],
        },
        include: {
          initiator: {
            select: { id: true, name: true },
          },
          receiver: {
            select: { id: true, name: true },
          },
        },
      });

      // Map to friend list (exclude current user)
      const friendList = friends.map(friendship => {
        if (friendship.initiatorId === userId) {
          return {
            friendshipId: friendship.id,
            friend: friendship.receiver,
            since: friendship.createdAt,
          };
        } else {
          return {
            friendshipId: friendship.id,
            friend: friendship.initiator,
            since: friendship.createdAt,
          };
        }
      });

      // Get pending requests (both sent and received)
      const pendingRequests = await prisma.friend.findMany({
        where: {
          OR: [
            { initiatorId: userId, status: "PENDING" },
            { receiverId: userId, status: "PENDING" },
          ],
        },
        include: {
          initiator: {
            select: { id: true, name: true },
          },
          receiver: {
            select: { id: true, name: true },
          },
        },
      });

      const sentRequests = pendingRequests
        .filter(req => req.initiatorId === userId)
        .map(req => ({
          requestId: req.id,
          to: req.receiver,
          sentAt: req.createdAt,
        }));

      const receivedRequests = pendingRequests
        .filter(req => req.receiverId === userId)
        .map(req => ({
          requestId: req.id,
          from: req.initiator,
          receivedAt: req.createdAt,
        }));

      res.status(200).json({
        friends: friendList,
        sentRequests,
        receivedRequests,
      });
    } catch (error) {
      console.error("Error fetching friends:", error);
      handleApiError(error, res);
    }
  });
}
