import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { verifyToken } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get all accepted friendships
    const friends = await prisma.friend.findMany({
      where: {
        AND: [
          {
            OR: [
              { initiatorId: decoded.userId },
              { receiverId: decoded.userId },
            ],
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
    const friendList = friends.map((friendship) => {
      if (friendship.initiatorId === decoded.userId) {
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
          { initiatorId: decoded.userId, status: "PENDING" },
          { receiverId: decoded.userId, status: "PENDING" },
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
      .filter((req) => req.initiatorId === decoded.userId)
      .map((req) => ({
        requestId: req.id,
        to: req.receiver,
        sentAt: req.createdAt,
      }));

    const receivedRequests = pendingRequests
      .filter((req) => req.receiverId === decoded.userId)
      .map((req) => ({
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
    res.status(500).json({ error: "Internal server error" });
  }
}
