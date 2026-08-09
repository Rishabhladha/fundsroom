import { Router } from 'express';
import multer from 'multer';
import { login, signup, getMe, updateProfile, uploadAvatar, getAllUsers, toggleUserStatus } from './auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public login
router.post('/login', login);

// Authenticated user profile
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

// Admin-only User Account Management
router.post('/users', authMiddleware, requireRole('ADMIN'), signup);
router.get('/users', authMiddleware, requireRole('ADMIN'), getAllUsers);
router.patch('/users/:id/status', authMiddleware, requireRole('ADMIN'), toggleUserStatus);

export default router;
