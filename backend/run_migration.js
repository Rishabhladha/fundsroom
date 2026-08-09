import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'sql', '01_payments_ledger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration: 01_payments_ledger.sql');
    await pool.query(sql);
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
