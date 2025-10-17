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

  const { requestId, action } = req.body;

  if (!requestId || !action) {
    return res
      .status(400)
      .json({ error: "Request ID and action are required" });
  }

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    // Find friend request where current user is the receiver
    const friendRequest = await prisma.friend.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    if (friendRequest.receiverId !== decoded.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to respond to this request" });
    }

    if (friendRequest.status !== "PENDING") {
      return res
        .status(400)
        .json({ error: "Friend request already responded to" });
    }

    // Update friend request status
    const updatedRequest = await prisma.friend.update({
      where: { id: requestId },
      data: {
        status: action === "accept" ? "ACCEPTED" : "REJECTED",
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

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
