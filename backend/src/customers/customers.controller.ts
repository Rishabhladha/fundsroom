import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { AppError, Customer, FollowUp, CustomerType, CustomerStatus } from '../types';
import {
  parsePagination,
  buildMeta,
  requireFields,
  isValidEnum,
} from '../utils/pagination';

const CUSTOMER_TYPES: CustomerType[] = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
const CUSTOMER_STATUSES: CustomerStatus[] = ['LEAD', 'ACTIVE', 'INACTIVE'];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers
// Supports: ?search= ?status= ?type= ?page= ?limit=
// ─────────────────────────────────────────────────────────────────────────────

export async function listCustomers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { search, status, type } = req.query as Record<string, string>;

    // Build dynamic WHERE clauses
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (search) {
      conditions.push(`(c.name ILIKE $${i} OR c.mobile ILIKE $${i} OR c.business_name ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && isValidEnum(status, CUSTOMER_STATUSES)) {
      conditions.push(`c.status = $${i}`);
      params.push(status);
      i++;
    }
    if (type && isValidEnum(type, CUSTOMER_TYPES)) {
      conditions.push(`c.type = $${i}`);
      params.push(type);
      i++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total (without pagination)
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM customers c ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch page
    const dataResult = await query<Customer>(
      `SELECT c.* FROM customers c
       ${where}
       ORDER BY c.created_at DESC
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:id
// ─────────────────────────────────────────────────────────────────────────────

export async function getCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await query<Customer>(
      'SELECT * FROM customers WHERE id = $1',
      [req.params.id]
    );

    if (!result.rows[0]) {
      throw new AppError(404, 'Customer not found', 'NotFound');
    }

    const financialResult = await query<{
      total_billed: string;
      total_paid: string;
    }>(
      `
      SELECT 
        (SELECT COALESCE(SUM(total_amount), 0) FROM challans WHERE customer_id = $1 AND status != 'CANCELLED') as total_billed,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE customer_id = $1) as total_paid
      `,
      [req.params.id]
    );

    const financials = financialResult.rows[0];
    const outstanding_balance = (parseFloat(financials.total_billed) - parseFloat(financials.total_paid)).toFixed(2);

    res.json({ 
      data: {
        ...result.rows[0],
        total_billed: financials.total_billed,
        total_paid: financials.total_paid,
        outstanding_balance
      } 
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:id/ledger
// ─────────────────────────────────────────────────────────────────────────────

export async function getCustomerLedger(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM customers WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      throw new AppError(404, 'Customer not found', 'NotFound');
    }

    const ledgerResult = await query(
      `
      SELECT 
        id, 
        'CHALLAN' as type, 
        challan_number as reference, 
        total_amount as amount, 
        created_at as date 
      FROM challans 
      WHERE customer_id = $1 AND status != 'CANCELLED'
      
      UNION ALL
      
      SELECT 
        id, 
        'PAYMENT' as type, 
        method as reference, 
        amount, 
        payment_date as date 
      FROM payments 
      WHERE customer_id = $1
      
      ORDER BY date ASC
      `,
      [id]
    );

    let balance = 0;
    const ledger = ledgerResult.rows.map(entry => {
      if (entry.type === 'CHALLAN') {
        balance += parseFloat(entry.amount);
      } else {
        balance -= parseFloat(entry.amount);
      }
      return {
        ...entry,
        running_balance: balance.toFixed(2)
      };
    });

    res.json({ data: ledger.reverse() }); // Return newest first for UI
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customers
// ─────────────────────────────────────────────────────────────────────────────

export async function createCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as Record<string, string>;
    requireFields(body, ['name', 'mobile', 'type']);

    const { name, mobile, email, business_name, gst_number, type, address, status, follow_up_date } = body;

    if (!isValidEnum(type, CUSTOMER_TYPES)) {
      throw new AppError(400, `type must be one of: ${CUSTOMER_TYPES.join(', ')}`, 'ValidationError');
    }

    const statusVal: CustomerStatus = isValidEnum(status, CUSTOMER_STATUSES) ? status : 'LEAD';

    const result = await query<Customer>(
      `INSERT INTO customers (name, mobile, email, business_name, gst_number, type, address, status, follow_up_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        name.trim(),
        mobile.trim(),
        email?.trim() || null,
        business_name?.trim() || null,
        gst_number?.trim() || null,
        type,
        address?.trim() || null,
        statusVal,
        follow_up_date || null,
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/customers/:id
// ─────────────────────────────────────────────────────────────────────────────

export async function updateCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check customer exists
    const existing = await query<Customer>(
      'SELECT id FROM customers WHERE id = $1',
      [req.params.id]
    );
    if (!existing.rows[0]) {
      throw new AppError(404, 'Customer not found', 'NotFound');
    }

    const body = req.body as Record<string, string | undefined>;
    const allowed = ['name','mobile','email','business_name','gst_number','type','address','status','follow_up_date'];

    // Build dynamic SET clause — only update fields that are provided
    const setClauses: string[] = ['updated_at = now()'];
    const params: unknown[] = [];
    let i = 1;

    for (const field of allowed) {
      if (body[field] !== undefined) {
        // Validate enum fields
        if (field === 'type' && !isValidEnum(body[field]!, CUSTOMER_TYPES)) {
          throw new AppError(400, `type must be one of: ${CUSTOMER_TYPES.join(', ')}`, 'ValidationError');
        }
        if (field === 'status' && !isValidEnum(body[field]!, CUSTOMER_STATUSES)) {
          throw new AppError(400, `status must be one of: ${CUSTOMER_STATUSES.join(', ')}`, 'ValidationError');
        }
        setClauses.push(`${field} = $${i}`);
        params.push(body[field] === '' ? null : body[field]);
        i++;
      }
    }

    params.push(req.params.id);

    const result = await query<Customer>(
      `UPDATE customers SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customers/:id/follow-ups
// ─────────────────────────────────────────────────────────────────────────────

export async function addFollowUp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    requireFields(req.body, ['note']);

    const existing = await query<{ id: string }>(
      'SELECT id FROM customers WHERE id = $1',
      [req.params.id]
    );
    if (!existing.rows[0]) {
      throw new AppError(404, 'Customer not found', 'NotFound');
    }

    const result = await query<FollowUp>(
      `INSERT INTO follow_ups (customer_id, note, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.body.note.trim(), req.user!.id]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:id/follow-ups
// ─────────────────────────────────────────────────────────────────────────────

export async function getFollowUps(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await query<{ id: string }>(
      'SELECT id FROM customers WHERE id = $1',
      [req.params.id]
    );
    if (!existing.rows[0]) {
      throw new AppError(404, 'Customer not found', 'NotFound');
    }

    const result = await query<FollowUp>(
      `SELECT f.*, u.name AS created_by_name
       FROM follow_ups f
       JOIN users u ON u.id = f.created_by
       WHERE f.customer_id = $1
       ORDER BY f.created_at DESC`,
      [req.params.id]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/customers/:id/follow-ups/:followUpId
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteFollowUp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { followUpId } = req.params;
    const result = await query('DELETE FROM follow_ups WHERE id = $1 RETURNING id', [followUpId]);
    if (result.rows.length === 0) {
      throw new AppError(404, 'Follow-up note not found', 'NotFound');
    }
    res.json({ message: 'Follow-up note deleted successfully' });
  } catch (err) {
    next(err);
  }
}
