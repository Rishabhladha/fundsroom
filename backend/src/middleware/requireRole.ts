import { Request, Response, NextFunction } from 'express';
import { Role, AppError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// requireRole — factory middleware
// Usage: router.post('/...', authMiddleware, requireRole('ADMIN', 'SALES'), handler)
// Returns 403 if req.user.role is not in the allowed list.
// Always call authMiddleware before requireRole.
// ─────────────────────────────────────────────────────────────────────────────

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated', 'Unauthorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `This action requires one of: ${allowedRoles.join(', ')}`,
          'Forbidden'
        )
      );
    }

    next();
  };
}
