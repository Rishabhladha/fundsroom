import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, JwtPayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// authMiddleware
// Reads the Authorization: Bearer <token> header, verifies the JWT,
// and attaches the decoded payload to req.user.
// ─────────────────────────────────────────────────────────────────────────────

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'No token provided', 'Unauthorized'));
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, 'Token expired — please log in again', 'Unauthorized'));
    }
    return next(new AppError(401, 'Invalid token', 'Unauthorized'));
  }
}
