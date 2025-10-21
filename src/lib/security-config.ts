// Security configuration for the application
export const securityConfig = {
  // Rate limiting configurations
  rateLimits: {
    // Authentication endpoints - strict limits
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per 15 minutes
      message: "Too many authentication attempts. Please try again later.",
    },

    // Content creation - moderate limits
    content: {
      posts: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5,
        message: "Too many posts. Please slow down.",
      },
      comments: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
        message: "Too many comments. Please slow down.",
      },
    },

    // General API endpoints
    general: {
      windowMs: 60 * 1000,
      maxRequests: 100,
      message: "Too many requests. Please slow down.",
    },
  },

  contentLimits: {
    post: {
      minLength: 1,
      maxLength: 50000,
      allowedTags: [], // No HTML tags allowed
    },

    // Comments - still generous but shorter than posts
    comment: {
      minLength: 1,
      maxLength: 10000,
      allowedTags: [],
    },

    // User profiles
    profile: {
      name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_\-\s]+$/,
      },
      description: {
        maxLength: 1000,
      },
    },
  },

  // Security headers
  headers: {
    // Content Security Policy
    csp: {
      development:
        "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob:;",
      production:
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self';",
    },

    // Other security headers
    standard: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    },
  },

  // File upload limits
  upload: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxFilesPerUser: 50, // Max 10 images per user
  },

  // Session security
  session: {
    cookieName: "authToken",
    maxAge: 60 * 60, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  },

  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Not required for better UX
  },

  // Input sanitization
  sanitization: {
    // Remove dangerous characters
    removeControlChars: true,
    normalizeWhitespace: true,
    removeHtmlTags: true,
    allowedHtmlTags: [], // No HTML allowed
  },

  // Monitoring and logging
  monitoring: {
    logFailedAuth: true,
    logRateLimitHits: true,
    logSuspiciousActivity: true,
    alertThresholds: {
      failedAuthAttempts: 10, // Alert after 10 failed attempts
      rateLimitHits: 50, // Alert after 50 rate limit hits
    },
  },
};

// Environment-specific configurations
export const getSecurityConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    ...securityConfig,
    headers: {
      ...securityConfig.headers,
    },
    session: {
      ...securityConfig.session,
      secure: isProduction,
    },
  };
};
