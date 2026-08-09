import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Ensure Node resolves IPv4 addresses first to prevent 5+ second IPv6 DNS timeouts on Windows networks
dns.setDefaultResultOrder('ipv4first');

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
  max: 20,                  // max connections in pool
  idleTimeoutMillis: 300_000, // 5 minutes idle timeout to keep pool warm
  connectionTimeoutMillis: 15_000, // 15s connection timeout for cold connects
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

// Pre-warm initial DB connection asynchronously on server startup and ensure avatar_url column
pool.query('SELECT 1')
  .then(() => {
    console.log('⚡ Database connection pool initialized & pre-warmed.');
    return pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;');
  })
  .then(() => {
    console.log('✅ Users table schema verified (avatar_url column ready).');
  })
  .catch((err) => {
    console.warn('⚠️ Initial database pre-warm failed (will retry on demand):', err.message);
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

