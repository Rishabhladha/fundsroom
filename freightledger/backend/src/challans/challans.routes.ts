import { Router } from 'express';
import {
  listChallans,
  getChallan,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
  getInvoicePdf,
} from './challans.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authMiddleware);

// All roles can read challans
router.get('/', listChallans);
router.get('/:id', getChallan);

// Invoice PDF — ADMIN, ACCOUNTS, SALES (own challan check happens inside controller)
router.get('/:id/invoice.pdf', requireRole('ADMIN', 'ACCOUNTS', 'SALES'), getInvoicePdf);

// Create/edit DRAFT — ADMIN, SALES
router.post('/', requireRole('ADMIN', 'SALES'), createChallan);
router.patch('/:id', requireRole('ADMIN', 'SALES'), updateChallan);

// Confirm/cancel — ADMIN, SALES
router.post('/:id/confirm', requireRole('ADMIN', 'SALES'), confirmChallan);
router.post('/:id/cancel', requireRole('ADMIN', 'SALES'), cancelChallan);

export default router;
