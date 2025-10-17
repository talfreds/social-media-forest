import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { verifyToken } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { receiverName } = req.body;

  if (!receiverName) {
    return res.status(400).json({ error: "Receiver name is required" });
  }

  try {
    // Find receiver by display name
    const receiver = await prisma.user.findUnique({
      where: { name: receiverName },
    });

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    if (receiver.id === decoded.userId) {
      return res
        .status(400)
        .json({ error: "Cannot send friend request to yourself" });
    }

    // Check if request already exists
    const existingRequest = await prisma.friend.findFirst({
      where: {
        OR: [
          { initiatorId: decoded.userId, receiverId: receiver.id },
          { initiatorId: receiver.id, receiverId: decoded.userId },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "ACCEPTED") {
        return res.status(400).json({ error: "Already friends" });
      }
      if (existingRequest.status === "PENDING") {
        return res.status(400).json({ error: "Friend request already sent" });
      }
      if (existingRequest.status === "BLOCKED") {
        return res.status(403).json({ error: "Cannot send friend request" });
      }
    }

    // Create friend request
    const friendRequest = await prisma.friend.create({
      data: {
        initiatorId: decoded.userId,
        receiverId: receiver.id,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
