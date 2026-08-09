import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { AppError, User, Role } from '../types';
import { requireFields, isValidEmail, isValidEnum } from '../utils/pagination';

const ROLES: Role[] = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup
// Creates a new user. Protected — only ADMIN can call this.
// ─────────────────────────────────────────────────────────────────────────────

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role } = req.body as Record<string, string>;

    requireFields(req.body, ['name', 'email', 'password', 'role']);

    if (!isValidEmail(email)) {
      throw new AppError(400, 'Invalid email address', 'ValidationError');
    }

    if (password.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters', 'ValidationError');
    }

    if (!isValidEnum(role, ROLES)) {
      throw new AppError(400, `Role must be one of: ${ROLES.join(', ')}`, 'ValidationError');
    }

    // Check email uniqueness
    const existing = await query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      throw new AppError(409, 'A user with this email already exists', 'Conflict');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await query<User>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    requireFields(req.body, ['email', 'password']);

    const result = await query<User>(
      `SELECT id, name, email, password_hash, role, is_active
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'Unauthorized');
    }

    if (!user.is_active) {
      throw new AppError(403, 'This account has been deactivated', 'Forbidden');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new AppError(401, 'Invalid email or password', 'Unauthorized');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError(500, 'JWT not configured', 'InternalServerError');

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the currently authenticated user's profile.
// ─────────────────────────────────────────────────────────────────────────────

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated', 'Unauthorized');

    const result = await query<Omit<User, 'password_hash'>>(
      `SELECT id, name, email, role, is_active, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows[0]) {
      throw new AppError(404, 'User not found', 'NotFound');
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auth/profile
// Allows authenticated user to update their name or change password.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated', 'Unauthorized');

    const { name, password, newPassword } = req.body as Record<string, string>;

    const userRes = await query<User>('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userRes.rows[0];
    if (!user) throw new AppError(404, 'User not found', 'NotFound');

    let updatedName = user.name;
    let updatedHash = user.password_hash;

    if (name && name.trim()) {
      updatedName = name.trim();
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        throw new AppError(400, 'New password must be at least 8 characters', 'ValidationError');
      }
      if (password) {
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) throw new AppError(400, 'Current password is incorrect', 'ValidationError');
      }
      updatedHash = await bcrypt.hash(newPassword, 10);
    }

    const result = await query<User>(
      `UPDATE users
       SET name = $1, password_hash = $2
       WHERE id = $3
       RETURNING id, name, email, role, is_active, created_at`,
      [updatedName, updatedHash, req.user.id]
    );

    res.json({ message: 'Profile updated successfully', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/users
// Admin only — list all users
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Omit<User, 'password_hash'>>(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auth/users/:id/status
// Admin only — toggle user active/deactive status or change role
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body as { is_active?: boolean; role?: Role };

    if (req.user?.id === id && is_active === false) {
      throw new AppError(400, 'You cannot deactivate your own admin account', 'ValidationError');
    }

    const userRes = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) throw new AppError(404, 'User not found', 'NotFound');

    const current = userRes.rows[0];
    const newActive = typeof is_active === 'boolean' ? is_active : current.is_active;
    const newRole = role && ROLES.includes(role) ? role : current.role;

    const result = await query<User>(
      `UPDATE users
       SET is_active = $1, role = $2
       WHERE id = $3
       RETURNING id, name, email, role, is_active, created_at`,
      [newActive, newRole, id]
    );

    res.json({ message: 'User updated successfully', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

