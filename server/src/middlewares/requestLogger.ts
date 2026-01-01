import { Request, Response, NextFunction } from "express";

/**
 * Logs basic request metadata for debugging.
 *
 * @param req Express request.
 * @param res Express response.
 * @param next Next middleware.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.info(
      `${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`
    );
  });
  next();
}
