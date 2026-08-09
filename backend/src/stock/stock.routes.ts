import { Router } from 'express';
import { listStockMovements } from './stock.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// All roles can read global stock log
router.get('/', listStockMovements);

export default router;
