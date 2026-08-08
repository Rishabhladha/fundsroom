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

// Create/edit DRAFT — ADMIN, SALES, ACCOUNTS
router.post('/', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), createChallan);
router.patch('/:id', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), updateChallan);

// Confirm/cancel — ADMIN, ACCOUNTS (Sales creates draft, Accounts/Admin finalizes financial states)
router.post('/:id/confirm', requireRole('ADMIN', 'ACCOUNTS'), confirmChallan);
router.post('/:id/cancel', requireRole('ADMIN', 'ACCOUNTS'), cancelChallan);

export default router;
