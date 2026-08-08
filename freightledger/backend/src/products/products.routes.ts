import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  getMovements,
  addMovement,
} from './products.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authMiddleware);

// All roles can read products
router.get('/', listProducts);
router.get('/:id', getProduct);
router.get('/:id/movements', getMovements);

// Only ADMIN and WAREHOUSE can modify products/stock
router.post('/', requireRole('ADMIN', 'WAREHOUSE'), createProduct);
router.patch('/:id', requireRole('ADMIN', 'WAREHOUSE'), updateProduct);
router.post('/:id/movements', requireRole('ADMIN', 'WAREHOUSE'), addMovement);

export default router;
