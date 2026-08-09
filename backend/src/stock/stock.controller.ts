import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { StockMovement } from '../types';
import { parsePagination, buildMeta } from '../utils/pagination';

export async function listStockMovements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { productId, search } = req.query as Record<string, string>;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (productId) {
      conditions.push(`sm.product_id = $${i}`);
      params.push(productId);
      i++;
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${i} OR p.sku ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count 
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await query<StockMovement & { product_name: string; product_sku: string; created_by_name: string }>(
      `SELECT sm.*, 
              p.name AS product_name, 
              p.sku AS product_sku,
              u.name AS created_by_name
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       JOIN users u ON u.id = sm.created_by
       ${where}
       ORDER BY sm.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );

    res.json({
      data: dataResult.rows,
      meta: buildMeta(total, page, limit),
    });
  } catch (err) {
    next(err);
  }
}
