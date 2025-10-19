import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validationSchemas = {
  signup: {
    type: "object",
    required: ["email", "password", "name"],
    properties: {
      email: {
        type: "string",
        format: "email",
        maxLength: 255,
      },
      password: {
        type: "string",
        minLength: 8,
        maxLength: 128,
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", // At least one lowercase, uppercase, and digit
      },
      name: {
        type: "string",
        minLength: 2,
        maxLength: 50,
        pattern: "^[a-zA-Z0-9_\\-\\s]+$", // Alphanumeric, underscore, dash, spaces
      },
    },
    additionalProperties: false,
  },

  login: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        maxLength: 255,
      },
      password: {
        type: "string",
        maxLength: 128,
      },
    },
    additionalProperties: false,
  },
  post: {
    type: "object",
    required: ["content"],
    properties: {
      content: {
        type: "string",
        minLength: 1,
        maxLength: 50000,
        pattern: "^[\\s\\S]*$", // Allow any characters including newlines
      },
      location: {
        type: "object",
        properties: {
          lat: { type: "number", minimum: -90, maximum: 90 },
          lon: { type: "number", minimum: -180, maximum: 180 },
        },
        additionalProperties: false,
      },
      forestId: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
      imageUrl: {
        type: "string",
        maxLength: 10000, // Base64 images can be large
        pattern: "^data:image\\/(jpeg|png|gif|webp);base64,", // Validate base64 image format
      },
    },
    additionalProperties: false,
  },

  // Comment creation - generous limits
  comment: {
    type: "object",
    required: ["content", "postId"],
    properties: {
      content: {
        type: "string",
        minLength: 1,
        maxLength: 10000, // 10k characters for comments - still very generous
        pattern: "^[\\s\\S]*$",
      },
      postId: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
      parentId: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
      imageUrl: {
        type: "string",
        maxLength: 10000,
        pattern: "^data:image\\/(jpeg|png|gif|webp);base64,",
      },
    },
    additionalProperties: false,
  },

  // Forest creation
  forest: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        pattern: "^[a-zA-Z0-9\\s\\-_.,!?()]+$", // Allow common punctuation
      },
      description: {
        type: "string",
        maxLength: 1000,
        pattern: "^[\\s\\S]*$",
      },
      isPrivate: {
        type: "boolean",
      },
    },
    additionalProperties: false,
  },

  // Friend requests
  friendRequest: {
    type: "object",
    required: ["receiverName"],
    properties: {
      receiverName: {
        type: "string",
        minLength: 2,
        maxLength: 50,
        pattern: "^[a-zA-Z0-9_\\-\\s]+$",
      },
    },
    additionalProperties: false,
  },

  friendResponse: {
    type: "object",
    required: ["requestId", "action"],
    properties: {
      requestId: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
      action: {
        type: "string",
        enum: ["accept", "reject", "block"],
      },
    },
    additionalProperties: false,
  },

  // Image upload
  imageUpload: {
    type: "object",
    required: ["imageData", "mimeType"],
    properties: {
      imageData: {
        type: "string",
        minLength: 1,
        maxLength: 10000000, // 10MB base64 limit
        pattern: "^data:image\\/(jpeg|png|gif|webp);base64,",
      },
      mimeType: {
        type: "string",
        enum: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      },
    },
    additionalProperties: false,
  },
};

// Compile schemas
export const validators = {
  signup: ajv.compile(validationSchemas.signup),
  login: ajv.compile(validationSchemas.login),
  post: ajv.compile(validationSchemas.post),
  comment: ajv.compile(validationSchemas.comment),
  forest: ajv.compile(validationSchemas.forest),
  friendRequest: ajv.compile(validationSchemas.friendRequest),
  friendResponse: ajv.compile(validationSchemas.friendResponse),
  imageUpload: ajv.compile(validationSchemas.imageUpload),
};

// Validation helper function
export function validateInput<T>(
  validator: any,
  data: unknown
): { isValid: boolean; data?: T; errors?: string[] } {
  const isValid = validator(data);

  if (isValid) {
    return { isValid: true, data: data as T };
  }

  const errors = validator.errors?.map((error: any) => {
    const path = error.instancePath || error.schemaPath;
    return `${path}: ${error.message}`;
  }) || ["Invalid input"];

  return { isValid: false, errors };
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\s+/g, " "); // Normalize whitespace
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}
