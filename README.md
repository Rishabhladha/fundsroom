# FreightLedger

> Mini ERP + CRM Operations Portal — warehouse manifest aesthetic, production-grade business logic.

---

## Stack

| | Technology |
|---|---|
| **Backend** | Node.js · Express · TypeScript · PostgreSQL (Supabase) · node-postgres · JWT · bcryptjs · pdfkit |
| **Frontend** | React 18 (JS) · Vite · TanStack Query · Zustand · Tailwind CSS · React Router v6 |

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project

### 2. Database Setup

1. Go to your Supabase project → **SQL Editor**
2. Run `backend/sql/schema.sql` (creates all tables and ENUMs)
3. Run `backend/sql/seed.sql` (inserts demo data)

### 3. Backend

```bash
cd freightledger/backend
cp ../.env.example .env          # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev                       # starts on http://localhost:5000
```

### 4. Frontend

```bash
cd freightledger/frontend
cp .env.example .env              # VITE_API_URL=http://localhost:5000
npm install
npm run dev                       # starts on http://localhost:5173
```

---

## Demo Users (from seed.sql)

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@freightledger.com | `Admin@1234` |
| SALES | sales@freightledger.com | `Sales@1234` |
| WAREHOUSE | warehouse@freightledger.com | `Warehouse@1234` |
| ACCOUNTS | accounts@freightledger.com | `Accounts@1234` |

---

## Role Permissions

| Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|---|---|---|---|
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Customers (CRUD) | ✅ | ✅ | ❌ | 👁 Read |
| Follow-ups | ✅ | ✅ | ❌ | 👁 Read |
| Products (CRUD) | ✅ | 👁 Read | ✅ | 👁 Read |
| Stock Adjustments | ✅ | ❌ | ✅ | ❌ |
| Challans (CRUD) | ✅ | ✅ | 👁 Read | 👁 Read |
| Confirm/Cancel Challan | ✅ | ✅ | ❌ | ❌ |
| Invoice PDF Export | ✅ | ✅ (own) | ❌ | ✅ |

---

## Key Business Rules

1. **Stock never goes negative** — enforced inside a Postgres transaction with `SELECT ... FOR UPDATE` row locks, not just in the frontend
2. **Challans store snapshots** — product name and price at time of sale are copied to `challan_items`; editing the product later does not change existing challans
3. **Every stock change has a movement row** — `stock_movements` always reconstructs the current `products.stock`
4. **Confirm is idempotent** — confirming an already-confirmed challan returns 400, not a double-deduction
5. **Cancelling restocks** — cancelling a CONFIRMED challan creates IN movements for all line items

---

## API Base URL

`http://localhost:5000/api`

Health check: `GET /api/health`

---

## Folder Structure

```
freightledger/
├── .env.example
├── .gitignore
├── README.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── sql/
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── src/
│       ├── server.ts
│       ├── db.ts
│       ├── types/index.ts
│       ├── middleware/
│       ├── utils/
│       ├── auth/
│       ├── customers/
│       ├── products/
│       └── challans/
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── theme/tokens.js
        ├── lib/
        ├── store/
        ├── features/
        └── components/
```
