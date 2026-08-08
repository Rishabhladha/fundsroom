import { Router } from 'express';
import { login, signup, getMe } from './auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// POST /api/auth/signup — admin-only in practice
router.post('/signup', authMiddleware, requireRole('ADMIN'), signup);

// POST /api/auth/login — public
router.post('/login', login);

// GET /api/auth/me — requires valid JWT
router.get('/me', authMiddleware, getMe);

export default router;
