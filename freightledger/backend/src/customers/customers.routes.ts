import { Router } from 'express';
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  addFollowUp,
  getFollowUps,
  deleteFollowUp,
} from './customers.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// All customer routes require auth
router.use(authMiddleware);

// List / detail — ADMIN, SALES, ACCOUNTS
router.get('/', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), listCustomers);
router.get('/:id', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), getCustomer);

// Create / update — ADMIN, SALES only
router.post('/', requireRole('ADMIN', 'SALES'), createCustomer);
router.patch('/:id', requireRole('ADMIN', 'SALES'), updateCustomer);

// Follow-ups — ADMIN, SALES (write), ACCOUNTS (read via GET)
router.get('/:id/follow-ups', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), getFollowUps);
router.post('/:id/follow-ups', requireRole('ADMIN', 'SALES'), addFollowUp);
router.delete('/:id/follow-ups/:followUpId', requireRole('ADMIN', 'SALES'), deleteFollowUp);

export default router;
