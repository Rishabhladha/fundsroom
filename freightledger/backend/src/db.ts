import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Connection Pool
// Single Pool instance shared across the entire app.
// PG picks up DATABASE_URL from the environment automatically.
// ─────────────────────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set. Check your .env file.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase hosted connections
  max: 20,           // max connections in pool
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

// ─────────────────────────────────────────────────────────────────────────────
// Query helper — use for all single-query operations (no transaction needed)
// ─────────────────────────────────────────────────────────────────────────────

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(sql, params);
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction helper — use for multi-step operations (e.g., confirm challan)
// Usage:
//   const client = await getClient();
//   try {
//     await client.query('BEGIN');
//     ...
//     await client.query('COMMIT');
//   } catch (e) {
//     await client.query('ROLLBACK');
//     throw e;
//   } finally {
//     client.release();
//   }
// ─────────────────────────────────────────────────────────────────────────────

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

// ─────────────────────────────────────────────────────────────────────────────
// Health check — called from /api/health route to confirm DB is reachable
// ─────────────────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query<{ result: number }>('SELECT 1 AS result');
    return result.rows[0]?.result === 1;
  } catch {
    return false;
  }
}
