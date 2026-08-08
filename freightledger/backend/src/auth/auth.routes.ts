import { Router } from 'express';
import { login, signup, getMe, updateProfile, getAllUsers, toggleUserStatus } from './auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public login
router.post('/login', login);

// Authenticated user profile
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);

// Admin-only User Account Management
router.post('/users', authMiddleware, requireRole('ADMIN'), signup);
router.get('/users', authMiddleware, requireRole('ADMIN'), getAllUsers);
router.patch('/users/:id/status', authMiddleware, requireRole('ADMIN'), toggleUserStatus);

export default router;
