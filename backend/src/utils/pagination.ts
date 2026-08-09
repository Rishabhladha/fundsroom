import { Request } from 'express';
import { AppError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Pagination utilities
// Parses ?page= and ?limit= from the request query string.
// Returns { offset, limit } for SQL, and builds the meta object for responses.
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(req: Request, maxLimit = 100): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const rawLimit = parseInt(req.query.limit as string) || 20;
  const limit = Math.min(rawLimit, maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers — lightweight inline validation without extra libraries
// ─────────────────────────────────────────────────────────────────────────────

export function requireFields(
  body: Record<string, unknown>,
  fields: string[]
): void {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ''
  );
  if (missing.length > 0) {
    throw new AppError(400, `Missing required fields: ${missing.join(', ')}`, 'ValidationError');
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidEnum<T extends string>(value: string, allowed: T[]): value is T {
  return allowed.includes(value as T);
}
