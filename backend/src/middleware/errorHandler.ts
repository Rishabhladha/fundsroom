import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler — must be registered LAST in Express middleware chain
// Formats all errors into a consistent shape:
//   { statusCode, message, error, details? }
// ─────────────────────────────────────────────────────────────────────────────

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Default to 500 if not an AppError
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';
  const error = err instanceof AppError ? err.error : 'InternalServerError';
  const details = err instanceof AppError ? err.details : undefined;

  // Log 5xx errors to the console (in production, pipe to a logger service)
  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${statusCode} ${message}`, err.stack);
  }

  res.status(statusCode).json({
    statusCode,
    message,
    error,
    ...(details !== undefined && { details }),
  });
}
