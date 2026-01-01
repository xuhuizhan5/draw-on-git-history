import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

/**
 * Express error-handling middleware.
 *
 * @param error Error instance.
 * @param _req Express request.
 * @param res Express response.
 * @param _next Next middleware.
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
    return;
  }

  console.error("Unexpected error", error);
  res.status(500).json({
    error: "Unexpected server error.",
  });
}
