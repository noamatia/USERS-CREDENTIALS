import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate the request body or URL parameters
 * using express-validator. If there are validation errors,
 * a 400 response is sent with the first error message.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    console.error("Request validation error:", message);
    const errorResponse = {
      success: false,
      error: message,
    };
    res.status(400).json(errorResponse);
  } else {
    next();
  }
};
