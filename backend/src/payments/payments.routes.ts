import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { recordPayment, listPayments } from './payments.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), recordPayment);
router.get('/', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), listPayments);

export default router;
