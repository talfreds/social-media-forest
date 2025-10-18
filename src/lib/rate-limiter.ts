import { NextApiRequest, NextApiResponse } from "next";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const key = getClientId(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    const current = rateLimitStore.get(key);

    if (!current || current.resetTime < now) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      res.status(429).json({
        error: config.message || "Too many requests",
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      });
      return false;
    }

    // Increment counter
    current.count++;
    return true;
  };
}

function getClientId(req: NextApiRequest): string {
  // Use IP address as client identifier
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0]
    : req.connection.remoteAddress;
  return ip || "unknown";
}

// Note: Predefined rate limiters are now in security.ts using centralized configuration
