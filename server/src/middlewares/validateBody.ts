import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

/**
 * Creates a middleware to validate request bodies with Zod.
 *
 * @param schema Zod schema.
 * @return Express middleware.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return next(new ValidationError(message));
    }

    req.body = result.data;
    return next();
  };
}
