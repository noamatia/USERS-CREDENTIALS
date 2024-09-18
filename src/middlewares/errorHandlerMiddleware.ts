import { Request, Response, NextFunction } from "express";
import { CredentialManagerServiceError } from "../services/credentialManagerService";

// Define error response interfaces
interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * Error handler middleware to catch and handle errors.
 * @param {any} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof CredentialManagerServiceError) {
    console.error("ContractManagerServiceError:", err.message);
    const errorResponse: ErrorResponse = {
      success: false,
      error: err.message,
    };
    res.status(400).json(errorResponse);
  } else {
    console.error("Internal Server Error:", err);
    const errorResponse: ErrorResponse = {
      success: false,
      error: "An internal error occurred.",
    };
    res.status(500).json(errorResponse);
  }
}
