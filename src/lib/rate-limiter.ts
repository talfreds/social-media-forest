import { NextApiRequest, NextApiResponse } from "next";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

const rateLimitStore = new Map<string, number[]>();

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

export function rateLimit(config: RateLimitConfig) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === "test") {
      return true;
    }

    const key = getClientId(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create request timestamps for this key
    let requests = rateLimitStore.get(key) || [];

    // Remove requests outside the current window
    requests = requests.filter(timestamp => timestamp > windowStart);

    // Check if we've exceeded the limit
    if (requests.length >= config.maxRequests) {
      // Calculate time until the oldest request in the window expires
      const oldestRequest = Math.min(...requests);
      const timeUntilOldestExpires = Math.ceil(
        (oldestRequest + config.windowMs - now) / 1000
      );

      res.status(429).json({
        error: config.message || "Too many requests",
        retryAfter: timeUntilOldestExpires,
      });
      return false;
    }

    // Add current request timestamp
    requests.push(now);
    rateLimitStore.set(key, requests);

    // Clean up old entries periodically
    if (now - lastCleanup > CLEANUP_INTERVAL) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.length === 0 || v.every(timestamp => timestamp <= windowStart)) {
          rateLimitStore.delete(k);
        }
      }
      lastCleanup = now;
    }

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
    : req.connection?.remoteAddress;
  return ip || "unknown";
}

// Note: Predefined rate limiters are now in security.ts using centralized configuration
