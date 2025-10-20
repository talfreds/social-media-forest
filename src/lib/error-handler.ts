import { NextApiResponse } from "next";

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown, res: NextApiResponse) {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof Error) {
    logError(error, "API_HANDLER");

    return res.status(500).json({
      error: isProduction ? "Internal server error" : error.message,
      code: "INTERNAL_ERROR",
    });
  }

  return res.status(500).json({
    error: "Unknown error occurred",
    code: "UNKNOWN_ERROR",
  });
}

export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : "";

  if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr} Error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  } else {
    console.error(`${timestamp} ${contextStr} Unknown error:`, error);
  }
}
