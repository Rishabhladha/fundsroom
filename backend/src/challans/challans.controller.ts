import { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../db';
import { AppError, Challan, ChallanItem, ChallanStatus } from '../types';
import { parsePagination, buildMeta, requireFields } from '../utils/pagination';
import { generateChallanNumber } from '../utils/generateChallanNumber';
import { generateInvoicePdf } from './invoicePdf';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/challans
// ?status= ?customerId= ?from= ?to= ?page= ?limit=
// ─────────────────────────────────────────────────────────────────────────────

export async function listChallans(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { status, customerId, from, to } = req.query as Record<string, string>;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (status) {
      conditions.push(`ch.status = $${i}`);
      params.push(status.toUpperCase());
      i++;
    }
    if (customerId) {
      conditions.push(`ch.customer_id = $${i}`);
      params.push(customerId);
      i++;
    }
    if (from) {
      conditions.push(`ch.created_at >= $${i}`);
      params.push(from);
      i++;
    }
    if (to) {
      conditions.push(`ch.created_at <= $${i}::date + interval '1 day'`);
      params.push(to);
      i++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM challans ch ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await query<Challan>(
      `SELECT ch.*, c.name AS customer_name, u.name AS created_by_name
       FROM challans ch
       JOIN customers c ON c.id = ch.customer_id
       JOIN users u ON u.id = ch.created_by
       ${where}
       ORDER BY ch.created_at DESC
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
// GET /api/challans/:id
// Returns challan + all its line items
// ─────────────────────────────────────────────────────────────────────────────

export async function getChallan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const challanResult = await query<Challan>(
      `SELECT ch.*, c.name AS customer_name, c.mobile AS customer_mobile,
              c.gst_number AS customer_gst, c.address AS customer_address,
              u.name AS created_by_name
       FROM challans ch
       JOIN customers c ON c.id = ch.customer_id
       JOIN users u ON u.id = ch.created_by
       WHERE ch.id = $1`,
      [req.params.id]
    );

    if (!challanResult.rows[0]) {
      throw new AppError(404, 'Challan not found', 'NotFound');
    }

    const itemsResult = await query<ChallanItem>(
      `SELECT * FROM challan_items WHERE challan_id = $1 ORDER BY id`,
      [req.params.id]
    );

    // Calculate line totals and grand total
    const items = itemsResult.rows.map((item) => ({
      ...item,
      line_total: (parseFloat(item.unit_price_snapshot) * item.quantity).toFixed(2),
    }));

    const grand_total = items.reduce(
      (sum, item) => sum + parseFloat(item.unit_price_snapshot) * item.quantity,
      0
    );

    res.json({
      data: {
        ...challanResult.rows[0],
        items,
        grand_total: grand_total.toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/challans — Create a DRAFT challan
// Body: { customerId, items: [{ productId, quantity }] }
// ─────────────────────────────────────────────────────────────────────────────

export async function createChallan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    requireFields(req.body, ['customerId', 'items']);

    const { customerId, items, tax_rate = 0, discount_amount = 0 } = req.body as {
      customerId: string;
      items: { productId: string; quantity: number }[];
      tax_rate?: number;
      discount_amount?: number;
    };

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError(400, 'items must be a non-empty array', 'ValidationError');
    }

    // Validate each line item has required fields
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new AppError(
          400,
          'Each item must have productId and quantity > 0',
          'ValidationError'
        );
      }
    }

    // Validate customer exists
    const customerCheck = await query<{ id: string }>(
      'SELECT id FROM customers WHERE id = $1',
      [customerId]
    );
    if (!customerCheck.rows[0]) {
      throw new AppError(404, 'Customer not found', 'NotFound');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Generate challan number atomically inside the transaction
      const challanNumber = await generateChallanNumber(client);

      // We will first fetch product details to calculate subtotal
      let subtotal = 0;
      const productDetails: { id: string; name: string; sku: string; unit_price: string; quantity: number }[] = [];

      for (const item of items) {
        const productResult = await client.query<{
          id: string;
          name: string;
          sku: string;
          unit_price: string;
          is_active: boolean;
        }>(
          'SELECT id, name, sku, unit_price, is_active FROM products WHERE id = $1',
          [item.productId]
        );

        if (!productResult.rows[0]) {
          throw new AppError(404, `Product ${item.productId} not found`, 'NotFound');
        }
        if (!productResult.rows[0].is_active) {
          throw new AppError(400, `Product ${productResult.rows[0].sku} is inactive`, 'ValidationError');
        }

        const product = productResult.rows[0];
        subtotal += parseFloat(product.unit_price) * item.quantity;
        productDetails.push({ ...product, quantity: item.quantity });
      }

      const totalQty = items.reduce((sum, i) => sum + Number(i.quantity), 0);
      const finalTax = isNaN(Number(tax_rate)) ? 0 : Number(tax_rate);
      const finalDiscount = isNaN(Number(discount_amount)) ? 0 : Number(discount_amount);
      const taxAmount = (subtotal * finalTax) / 100;
      const totalAmount = subtotal + taxAmount - finalDiscount;

      // Create the challan header
      const challanResult = await client.query<Challan>(
        `INSERT INTO challans (challan_number, customer_id, total_quantity, subtotal, tax_rate, discount_amount, total_amount, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          challanNumber,
          customerId,
          totalQty,
          subtotal,
          finalTax,
          finalDiscount,
          totalAmount,
          req.user!.id,
        ]
      );

      const challan = challanResult.rows[0];

      // Insert line items
      for (const pd of productDetails) {

        await client.query(
          `INSERT INTO challan_items
           (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            challan.id,
            pd.id,
            pd.name,
            pd.sku,
            pd.unit_price,
            pd.quantity,
          ]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ data: { ...challan, challan_number: challanNumber } });
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
// PATCH /api/challans/:id — Edit a DRAFT challan's line items
// Body: { items: [{ productId, quantity }] } — replaces all existing items
// ─────────────────────────────────────────────────────────────────────────────

export async function updateChallan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const challanResult = await query<Challan>(
      'SELECT * FROM challans WHERE id = $1',
      [req.params.id]
    );

    if (!challanResult.rows[0]) {
      throw new AppError(404, 'Challan not found', 'NotFound');
    }

    const challan = challanResult.rows[0];

    if (challan.status !== 'DRAFT') {
      throw new AppError(
        400,
        `Cannot edit challan ${challan.challan_number} — it is ${challan.status}`,
        'BadRequest'
      );
    }

    // SALES can only edit their own challans
    if (req.user!.role === 'SALES' && challan.created_by !== req.user!.id) {
      throw new AppError(403, 'You can only edit your own challans', 'Forbidden');
    }

    const { items, customerId, tax_rate, discount_amount } = req.body as {
      items?: { productId: string; quantity: number }[];
      customerId?: string;
      tax_rate?: number;
      discount_amount?: number;
    };

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Update customer if provided
      if (customerId) {
        const customerCheck = await client.query<{ id: string }>(
          'SELECT id FROM customers WHERE id = $1',
          [customerId]
        );
        if (!customerCheck.rows[0]) throw new AppError(404, 'Customer not found', 'NotFound');

        await client.query(
          'UPDATE challans SET customer_id = $1 WHERE id = $2',
          [customerId, challan.id]
        );
      }

      // Replace line items if provided
      if (items && Array.isArray(items)) {
        if (items.length === 0) {
          throw new AppError(400, 'items must be a non-empty array', 'ValidationError');
        }

        // Delete existing items
        await client.query('DELETE FROM challan_items WHERE challan_id = $1', [challan.id]);

        // Insert new items
        let totalQty = 0;
        let subtotal = 0;
        
        for (const item of items) {
          if (!item.productId || !item.quantity || item.quantity <= 0) {
            throw new AppError(400, 'Each item needs productId and quantity > 0', 'ValidationError');
          }

          const productResult = await client.query<{
            id: string; name: string; sku: string; unit_price: string; is_active: boolean;
          }>(
            'SELECT id, name, sku, unit_price, is_active FROM products WHERE id = $1',
            [item.productId]
          );

          if (!productResult.rows[0]) throw new AppError(404, `Product ${item.productId} not found`, 'NotFound');
          if (!productResult.rows[0].is_active) {
            throw new AppError(400, `Product ${productResult.rows[0].sku} is inactive`, 'ValidationError');
          }

          const product = productResult.rows[0];
          totalQty += Number(item.quantity);
          subtotal += parseFloat(product.unit_price) * item.quantity;

          await client.query(
            `INSERT INTO challan_items
             (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [challan.id, product.id, product.name, product.sku, product.unit_price, Number(item.quantity)]
          );
        }

        const finalTaxRate = tax_rate !== undefined ? Number(tax_rate) : parseFloat(challan.tax_rate);
        const finalDiscount = discount_amount !== undefined ? Number(discount_amount) : parseFloat(challan.discount_amount);
        const taxAmount = (subtotal * finalTaxRate) / 100;
        const totalAmount = subtotal + taxAmount - finalDiscount;

        await client.query(
          `UPDATE challans SET 
           total_quantity = $1, 
           subtotal = $2, 
           tax_rate = $3, 
           discount_amount = $4, 
           total_amount = $5 
           WHERE id = $6`,
          [totalQty, subtotal, finalTaxRate, finalDiscount, totalAmount, challan.id]
        );
      } else if (tax_rate !== undefined || discount_amount !== undefined) {
        // Just update tax/discount without changing items
        const subtotal = parseFloat(challan.subtotal);
        const finalTaxRate = tax_rate !== undefined ? (isNaN(Number(tax_rate)) ? 0 : Number(tax_rate)) : parseFloat(challan.tax_rate);
        const finalDiscount = discount_amount !== undefined ? (isNaN(Number(discount_amount)) ? 0 : Number(discount_amount)) : parseFloat(challan.discount_amount);
        const taxAmount = (subtotal * finalTaxRate) / 100;
        const totalAmount = subtotal + taxAmount - finalDiscount;

        await client.query(
          `UPDATE challans SET tax_rate = $1, discount_amount = $2, total_amount = $3 WHERE id = $4`,
          [finalTaxRate, finalDiscount, totalAmount, challan.id]
        );
      }

      await client.query('COMMIT');

      // Return the updated challan
      const updated = await query<Challan>('SELECT * FROM challans WHERE id = $1', [challan.id]);
      res.json({ data: updated.rows[0] });
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
// POST /api/challans/:id/confirm — THE CRITICAL TRANSACTION
//
// Algorithm:
//   BEGIN
//   For each line item:
//     SELECT stock FROM products WHERE id = $1 FOR UPDATE  ← row lock
//     if stock < quantity → collect shortfall
//   If any shortfall → ROLLBACK, return 409 with specific SKUs
//   Otherwise:
//     UPDATE products SET stock = stock - qty  (for each item)
//     INSERT stock_movements rows (type OUT)
//     UPDATE challans SET status = CONFIRMED, confirmed_at = now()
//   COMMIT
// ─────────────────────────────────────────────────────────────────────────────

export async function confirmChallan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const challanResult = await query<Challan>(
      'SELECT * FROM challans WHERE id = $1',
      [req.params.id]
    );

    if (!challanResult.rows[0]) {
      throw new AppError(404, 'Challan not found', 'NotFound');
    }

    const challan = challanResult.rows[0];

    if (challan.status === 'CONFIRMED') {
      throw new AppError(400, `Challan ${challan.challan_number} is already confirmed`, 'BadRequest');
    }
    if (challan.status === 'CANCELLED') {
      throw new AppError(400, `Cannot confirm a cancelled challan`, 'BadRequest');
    }

    // Fetch line items
    const itemsResult = await query<ChallanItem>(
      'SELECT * FROM challan_items WHERE challan_id = $1',
      [challan.id]
    );

    if (itemsResult.rows.length === 0) {
      throw new AppError(400, 'Cannot confirm a challan with no items', 'BadRequest');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Phase 1: Lock all product rows and check stock
      const shortfalls: { sku: string; available: number; required: number }[] = [];

      for (const item of itemsResult.rows) {
        // FOR UPDATE locks the row so no concurrent transaction can change stock
        const stockResult = await client.query<{
          id: string; stock: number; sku: string; name: string;
        }>(
          'SELECT id, stock, sku, name FROM products WHERE id = $1 FOR UPDATE',
          [item.product_id]
        );

        const product = stockResult.rows[0];
        if (!product) {
          throw new AppError(404, `Product for item ${item.sku_snapshot} not found`, 'NotFound');
        }

        if (product.stock < item.quantity) {
          shortfalls.push({
            sku: item.sku_snapshot,
            available: product.stock,
            required: item.quantity,
          });
        }
      }

      // If any product is short, ROLLBACK immediately with specific details
      if (shortfalls.length > 0) {
        await client.query('ROLLBACK');
        const message = shortfalls
          .map((s) => `SKU ${s.sku}: need ${s.required}, have ${s.available}`)
          .join('; ');
        throw new AppError(
          409,
          `Cannot confirm — stock insufficient: ${message}`,
          'StockError',
          shortfalls
        );
      }

      // Phase 2: All stock checks passed — deduct and record
      for (const item of itemsResult.rows) {
        // Deduct stock
        await client.query(
          'UPDATE products SET stock = stock - $1, updated_at = now() WHERE id = $2',
          [item.quantity, item.product_id]
        );

        // Record stock movement
        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, type, reason, created_by)
           VALUES ($1, $2, 'OUT', $3, $4)`,
          [
            item.product_id,
            item.quantity,
            `Dispatched per challan ${challan.challan_number}`,
            req.user!.id,
          ]
        );
      }

      // Mark challan as confirmed
      const result = await client.query<Challan>(
        `UPDATE challans
         SET status = 'CONFIRMED', confirmed_at = now()
         WHERE id = $1
         RETURNING *`,
        [challan.id]
      );

      await client.query('COMMIT');
      res.json({ data: result.rows[0] });
    } catch (e) {
      // Only ROLLBACK if still in a transaction (AppError from shortfall already rolled back)
      try { await client.query('ROLLBACK'); } catch { /* already rolled back */ }
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/challans/:id/cancel
//
// If was CONFIRMED → restock all items (IN movements)
// If was DRAFT → just mark CANCELLED (no stock to restore)
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelChallan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const challanResult = await query<Challan>(
      'SELECT * FROM challans WHERE id = $1',
      [req.params.id]
    );

    if (!challanResult.rows[0]) {
      throw new AppError(404, 'Challan not found', 'NotFound');
    }

    const challan = challanResult.rows[0];

    if (challan.status === 'CANCELLED') {
      throw new AppError(400, `Challan ${challan.challan_number} is already cancelled`, 'BadRequest');
    }

    const itemsResult = await query<ChallanItem>(
      'SELECT * FROM challan_items WHERE challan_id = $1',
      [challan.id]
    );

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Only restock if it was previously CONFIRMED (stock was actually deducted)
      if (challan.status === 'CONFIRMED') {
        for (const item of itemsResult.rows) {
          // Return stock
          await client.query(
            'UPDATE products SET stock = stock + $1, updated_at = now() WHERE id = $2',
            [item.quantity, item.product_id]
          );

          // Record the reversal as an IN movement
          await client.query(
            `INSERT INTO stock_movements (product_id, quantity, type, reason, created_by)
             VALUES ($1, $2, 'IN', $3, $4)`,
            [
              item.product_id,
              item.quantity,
              `Challan ${challan.challan_number} cancelled — stock restored`,
              req.user!.id,
            ]
          );
        }
      }

      const result = await client.query<Challan>(
        `UPDATE challans
         SET status = 'CANCELLED', cancelled_at = now()
         WHERE id = $1
         RETURNING *`,
        [challan.id]
      );

      await client.query('COMMIT');
      res.json({ data: result.rows[0] });
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
// GET /api/challans/:id/invoice.pdf
// ─────────────────────────────────────────────────────────────────────────────

export async function getInvoicePdf(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const challanResult = await query<Challan & {
      customer_name: string;
      customer_mobile: string;
      customer_gst: string;
      customer_address: string;
      created_by_name: string;
    }>(
      `SELECT ch.*,
              c.name AS customer_name, c.mobile AS customer_mobile,
              c.gst_number AS customer_gst, c.address AS customer_address,
              u.name AS created_by_name
       FROM challans ch
       JOIN customers c ON c.id = ch.customer_id
       JOIN users u ON u.id = ch.created_by
       WHERE ch.id = $1`,
      [req.params.id]
    );

    if (!challanResult.rows[0]) {
      throw new AppError(404, 'Challan not found', 'NotFound');
    }

    const challan = challanResult.rows[0];

    // SALES can only download their own challan invoices
    if (req.user!.role === 'SALES' && challan.created_by !== req.user!.id) {
      throw new AppError(403, 'You can only download invoices for your own challans', 'Forbidden');
    }

    const itemsResult = await query<ChallanItem>(
      'SELECT * FROM challan_items WHERE challan_id = $1 ORDER BY id',
      [challan.id]
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${challan.challan_number}.pdf"`
    );

    // Stream the PDF directly to the response
    generateInvoicePdf(challan, itemsResult.rows, res);
  } catch (err) {
    next(err);
  }
}
