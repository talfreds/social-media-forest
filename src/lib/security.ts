import { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "./rate-limiter";
import { validateInput, sanitizeString, sanitizeHtml } from "./validation";
import { handleApiError, AppError } from "./error-handler";
import { getSecurityConfig } from "./security-config";
import { verifyToken } from "./auth";

// Security headers middleware
export function setSecurityHeaders(res: NextApiResponse) {
  const config = getSecurityConfig();

  // Set standard security headers
  Object.entries(config.headers.standard).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Set CSP based on environment
  const csp = config.headers.csp;
  if (csp && typeof csp === "object") {
    const cspValue =
      process.env.NODE_ENV === "production" ? csp.production : csp.development;
    if (cspValue) {
      res.setHeader("Content-Security-Policy", cspValue);
    }
  }
}

// Input sanitization middleware
export function sanitizeInput(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    if (req.body && typeof req.body === "object") {
      // Sanitize string fields
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === "string") {
          if (key === "content" || key === "description") {
            // For content fields, allow more formatting but sanitize HTML
            req.body[key] = sanitizeHtml(req.body[key]);
          } else {
            // For other fields, basic sanitization
            req.body[key] = sanitizeString(req.body[key]);
          }
        }
      });
    }
    next();
  } catch (error) {
    handleApiError(error, res);
  }
}

// Validation middleware factory
export function validateRequest<T>(
  validator: any,
  rateLimiter?: (req: NextApiRequest, res: NextApiResponse) => boolean
) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    try {
      if (rateLimiter && !rateLimiter(req, res)) {
        return;
      }

      const validation = validateInput<T>(validator, req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          error: "Invalid input",
          details: validation.errors,
        });
      }

      // Replace body with validated data
      req.body = validation.data;
      next();
    } catch (error) {
      handleApiError(error, res);
    }
  };
}

// Authentication middleware
export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.headers.cookie?.split("authToken=")[1]?.split(";")[0];

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate token using existing auth system
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Add user info to request for use in handlers
    (req as any).user = decoded;
    next();
  } catch (error) {
    handleApiError(error, res);
  }
}

// CORS middleware
export function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
}

// Request logging middleware
export function logRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers["user-agent"],
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 400) {
      console.error("API Error:", logData);
    } else {
      console.log("API Request:", logData);
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
}

// SQL injection prevention (basic)
export function preventSqlInjection(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|xp_|sp_)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  ];

  const checkString = (str: string) => {
    return sqlPatterns.some(pattern => pattern.test(str));
  };

  try {
    if (req.body && typeof req.body === "object") {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === "string" && checkString(value)) {
          return res.status(400).json({
            error: "Invalid input detected",
            code: "INVALID_INPUT",
          });
        }
      }
    }

    if (req.query && typeof req.query === "object") {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string" && checkString(value)) {
          return res.status(400).json({
            error: "Invalid input detected",
            code: "INVALID_INPUT",
          });
        }
      }
    }

    next();
  } catch (error) {
    handleApiError(error, res);
  }
}

// Content length validation
export function validateContentLength(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const config = getSecurityConfig();
  const contentLength = parseInt(req.headers["content-length"] || "0");
  const maxLength = config.upload.maxFileSize * 5; // 5x file size limit for requests

  if (contentLength > maxLength) {
    return res.status(413).json({
      error: "Request too large",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  next();
}

// Get security configuration
const config = getSecurityConfig();

// Rate limiters using centralized configuration
export const authRateLimit = rateLimit(config.rateLimits.auth);

export const commentRateLimit = rateLimit(config.rateLimits.content.comments);

export const postRateLimit = rateLimit(config.rateLimits.content.posts);

export const deleteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: "Too many delete requests, please slow down.",
});

export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: "Too many uploads, please slow down.",
});

// Comprehensive security middleware
export function applySecurityMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  setSecurityHeaders(res);
  setCorsHeaders(req, res);
  logRequest(req, res, next);
}

// Predefined middleware combinations
export const securityMiddleware = {
  // For authentication endpoints
  auth: [
    applySecurityMiddleware,
    validateContentLength,
    preventSqlInjection,
    sanitizeInput,
  ],

  // For content creation endpoints
  content: [
    applySecurityMiddleware,
    validateContentLength,
    preventSqlInjection,
    sanitizeInput,
  ],

  // For public endpoints
  public: [applySecurityMiddleware, validateContentLength, preventSqlInjection],
};
