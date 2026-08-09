/**
 * generate-hashes.js
 * Run with: node generate-hashes.js
 * Outputs the bcrypt hashes for the 4 demo users.
 * Copy-paste the UPDATE statements into Supabase SQL Editor AFTER running seed.sql
 */

const bcrypt = require('bcryptjs');

const COST = 10;

async function main() {
  const users = [
    { email: 'admin@freightledger.com',     password: 'Admin@1234',     role: 'ADMIN'     },
    { email: 'sales@freightledger.com',     password: 'Sales@1234',     role: 'SALES'     },
    { email: 'warehouse@freightledger.com', password: 'Warehouse@1234', role: 'WAREHOUSE' },
    { email: 'accounts@freightledger.com',  password: 'Accounts@1234',  role: 'ACCOUNTS'  },
  ];

  console.log('\n-- ============================================================');
  console.log('-- Run these UPDATE statements in Supabase SQL Editor');
  console.log('-- AFTER running schema.sql and seed.sql');
  console.log('-- ============================================================\n');

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, COST);
    console.log(`-- ${user.role} (${user.password})`);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${user.email}';\n`);
  }
}

main().catch(console.error);
