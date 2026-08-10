import { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../db';
import { AppError, Product, StockMovement, MovementType } from '../types';
import {
  parsePagination,
  buildMeta,
  requireFields,
  isValidEnum,
} from '../utils/pagination';

const MOVEMENT_TYPES: MovementType[] = ['IN', 'OUT'];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products
// ?search= ?category= ?lowStock=true ?page= ?limit=
// ─────────────────────────────────────────────────────────────────────────────

export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { search, category, lowStock } = req.query as Record<string, string>;

    const conditions: string[] = ['p.is_active = true'];
    const whereParams: unknown[] = [];
    let i = 1;

    if (search && search.trim()) {
      const q = search.trim();
      conditions.push(`(p.name ILIKE $${i} OR p.sku ILIKE $${i})`);
      whereParams.push(`%${q}%`);
      i++;
    }
    if (category) {
      conditions.push(`p.category = $${i}`);
      whereParams.push(category.toUpperCase());
      i++;
    }
    if (lowStock === 'true') {
      conditions.push('p.stock <= p.min_stock');
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM products p ${where}`,
      whereParams
    );
    const total = parseInt(countResult.rows[0].count);

    const queryParams = [...whereParams];
    let orderBy = 'ORDER BY p.category, p.name';

    if (search && search.trim()) {
      queryParams.push(`${search.trim()}%`); // index i
      const prefixIdx = i;
      orderBy = `ORDER BY 
        CASE 
          WHEN p.name ILIKE $${prefixIdx} THEN 1
          WHEN p.sku ILIKE $${prefixIdx} THEN 2
          WHEN p.name ILIKE $1 THEN 3
          WHEN p.sku ILIKE $1 THEN 4
          ELSE 5
        END,
        p.name ASC`;
      i++;
    }

    const dataResult = await query<Product>(
      `SELECT p.*, (p.stock <= p.min_stock) AS low_stock
       FROM products p
       ${where}
       ${orderBy}
       LIMIT $${i} OFFSET $${i + 1}`,
      [...queryParams, limit, offset]
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
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────────────────────

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await query<Product>(
      `SELECT p.*, (p.stock <= p.min_stock) AS low_stock
       FROM products p WHERE p.id = $1`,
      [req.params.id]
    );

    if (!result.rows[0]) {
      throw new AppError(404, 'Product not found', 'NotFound');
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/products
// ─────────────────────────────────────────────────────────────────────────────

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as Record<string, string | number>;
    requireFields(body, ['name', 'sku', 'category', 'unit_price']);

    const { name, sku, category, unit_price, stock, min_stock, location } = body;

    // Check SKU uniqueness
    const existing = await query<{ id: string }>(
      'SELECT id FROM products WHERE sku = $1',
      [String(sku).toUpperCase().trim()]
    );
    if (existing.rows[0]) {
      throw new AppError(409, `SKU ${sku} already exists`, 'Conflict');
    }

    const price = parseFloat(String(unit_price));
    if (isNaN(price) || price < 0) {
      throw new AppError(400, 'unit_price must be a positive number', 'ValidationError');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query<Product>(
        `INSERT INTO products (name, sku, category, unit_price, stock, min_stock, location)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [
          String(name).trim(),
          String(sku).toUpperCase().trim(),
          String(category).toUpperCase().trim(),
          price,
          parseInt(String(stock)) || 0,
          parseInt(String(min_stock)) || 0,
          location ? String(location).trim() : null,
        ]
      );

      const product = result.rows[0];

      // If initial stock > 0, create an opening stock movement
      if (product.stock > 0) {
        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, type, reason, created_by)
           VALUES ($1, $2, 'IN', $3, $4)`,
          [product.id, product.stock, 'Opening stock — product created', req.user!.id]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ data: product });
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
// PATCH /api/products/:id
// ─────────────────────────────────────────────────────────────────────────────

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await query<{ id: string }>(
      'SELECT id FROM products WHERE id = $1',
      [req.params.id]
    );
    if (!existing.rows[0]) {
      throw new AppError(404, 'Product not found', 'NotFound');
    }

    const body = req.body as Record<string, string | number | undefined>;
    const allowed = ['name', 'category', 'unit_price', 'min_stock', 'location', 'is_active'];

    const setClauses: string[] = ['updated_at = now()'];
    const params: unknown[] = [];
    let i = 1;

    for (const field of allowed) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = $${i}`);
        params.push(body[field]);
        i++;
      }
    }

    // SKU can be updated if not already taken
    if (body.sku !== undefined) {
      const skuCheck = await query<{ id: string }>(
        'SELECT id FROM products WHERE sku = $1 AND id != $2',
        [String(body.sku).toUpperCase().trim(), req.params.id]
      );
      if (skuCheck.rows[0]) {
        throw new AppError(409, `SKU ${body.sku} already in use`, 'Conflict');
      }
      setClauses.push(`sku = $${i}`);
      params.push(String(body.sku).toUpperCase().trim());
      i++;
    }

    params.push(req.params.id);

    const result = await query<Product>(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/:id/movements
// ─────────────────────────────────────────────────────────────────────────────

export async function getMovements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await query<{ id: string }>(
      'SELECT id FROM products WHERE id = $1',
      [req.params.id]
    );
    if (!existing.rows[0]) {
      throw new AppError(404, 'Product not found', 'NotFound');
    }

    const { page, limit, offset } = parsePagination(req);

    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM stock_movements WHERE product_id = $1',
      [req.params.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await query<StockMovement>(
      `SELECT sm.*, u.name AS created_by_name
       FROM stock_movements sm
       JOIN users u ON u.id = sm.created_by
       WHERE sm.product_id = $1
       ORDER BY sm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
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
// POST /api/products/:id/movements
// Manual stock adjustment (WAREHOUSE/ADMIN only)
// Body: { quantity, type, reason }
// ─────────────────────────────────────────────────────────────────────────────

export async function addMovement(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    requireFields(req.body, ['quantity', 'type', 'reason']);

    const { quantity, type, reason } = req.body as {
      quantity: number;
      type: string;
      reason: string;
    };

    const qty = parseInt(String(quantity));
    if (isNaN(qty) || qty <= 0) {
      throw new AppError(400, 'quantity must be a positive integer', 'ValidationError');
    }

    if (!isValidEnum(type, MOVEMENT_TYPES)) {
      throw new AppError(400, `type must be IN or OUT`, 'ValidationError');
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Lock the product row for the duration of this transaction
      const productResult = await client.query<{ id: string; stock: number; name: string; sku: string }>(
        'SELECT id, stock, name, sku FROM products WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );

      if (!productResult.rows[0]) {
        throw new AppError(404, 'Product not found', 'NotFound');
      }

      const product = productResult.rows[0];

      if (type === 'OUT' && product.stock < qty) {
        throw new AppError(
          409,
          `Cannot remove ${qty} units — only ${product.stock} in stock (SKU: ${product.sku})`,
          'StockError'
        );
      }

      // Update stock
      const delta = type === 'IN' ? qty : -qty;
      await client.query(
        'UPDATE products SET stock = stock + $1, updated_at = now() WHERE id = $2',
        [delta, product.id]
      );

      // Insert movement record
      const movResult = await client.query<StockMovement>(
        `INSERT INTO stock_movements (product_id, quantity, type, reason, created_by)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [product.id, qty, type, reason.trim(), req.user!.id]
      );

      await client.query('COMMIT');
      res.status(201).json({ data: movResult.rows[0] });
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
