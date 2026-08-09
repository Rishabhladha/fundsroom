import { PoolClient } from 'pg';

// ─────────────────────────────────────────────────────────────────────────────
// generateChallanNumber
// Must be called INSIDE an active transaction (receives the PoolClient).
// Uses an atomic UPDATE ... RETURNING to increment the counter for the year —
// this prevents the race condition you'd get from SELECT COUNT(*) + 1.
//
// If no counter row exists for this year yet, it inserts one first (ON CONFLICT).
//
// Returns a string like "CH-2026-000042"
// ─────────────────────────────────────────────────────────────────────────────

export async function generateChallanNumber(client: PoolClient): Promise<string> {
  const year = new Date().getFullYear();

  // Upsert the counter row, then atomically increment
  await client.query(
    `INSERT INTO challan_counters (year, last_no)
     VALUES ($1, 0)
     ON CONFLICT (year) DO NOTHING`,
    [year]
  );

  const result = await client.query<{ last_no: number }>(
    `UPDATE challan_counters
     SET last_no = last_no + 1
     WHERE year = $1
     RETURNING last_no`,
    [year]
  );

  const number = result.rows[0].last_no;
  // Zero-pad to 6 digits: CH-2026-000042
  return `CH-${year}-${String(number).padStart(6, '0')}`;
}
