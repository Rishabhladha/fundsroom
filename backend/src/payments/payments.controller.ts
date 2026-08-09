import { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../db';
import { AppError, Payment, Challan } from '../types';
import { parsePagination, buildMeta, requireFields } from '../utils/pagination';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments
// Body: { challanId, amount, paymentDate, method, referenceNumber, notes }
// ─────────────────────────────────────────────────────────────────────────────

export async function recordPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    requireFields(req.body, ['challanId', 'amount', 'paymentDate', 'method']);

    const { challanId, amount, paymentDate, method, referenceNumber, notes } = req.body;

    if (Number(amount) <= 0) {
      throw new AppError(400, 'Payment amount must be greater than 0', 'ValidationError');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Verify challan exists and get customer ID
      const challanResult = await client.query<Challan>(
        'SELECT * FROM challans WHERE id = $1',
        [challanId]
      );

      if (!challanResult.rows[0]) {
        throw new AppError(404, 'Challan not found', 'NotFound');
      }

      const challan = challanResult.rows[0];

      // Insert payment
      const paymentResult = await client.query<Payment>(
        `INSERT INTO payments (challan_id, customer_id, amount, payment_date, method, reference_number, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          challan.id,
          challan.customer_id,
          Number(amount),
          paymentDate,
          method,
          referenceNumber || null,
          notes || null,
          req.user!.id,
        ]
      );

      await client.query('COMMIT');
      res.status(201).json({ data: paymentResult.rows[0] });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments
// ─────────────────────────────────────────────────────────────────────────────

export async function listPayments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { challanId, customerId } = req.query as Record<string, string>;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (challanId) {
      conditions.push(`p.challan_id = $${i}`);
      params.push(challanId);
      i++;
    }
    if (customerId) {
      conditions.push(`p.customer_id = $${i}`);
      params.push(customerId);
      i++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM payments p ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await query<Payment>(
      `SELECT p.*, c.name AS customer_name, ch.challan_number, u.name AS created_by_name
       FROM payments p
       JOIN customers c ON c.id = p.customer_id
       JOIN challans ch ON ch.id = p.challan_id
       JOIN users u ON u.id = p.created_by
       ${where}
       ORDER BY p.payment_date DESC, p.created_at DESC
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
