# FreightLedger — Full Implementation Plan

A Mini ERP + CRM Operations Portal for wholesale/distribution companies with a warehouse-manifest aesthetic.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Backend runtime | Node.js + Express.js + TypeScript |
| Database | PostgreSQL via Supabase (connection string only) |
| DB client | node-postgres (`pg`) — plain parameterized SQL |
| Auth | Hand-rolled JWT + bcrypt |
| PDF Export | pdfkit |
| Frontend | React 18 (plain JS) + Vite |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Styling | Tailwind CSS |
| Routing | React Router v6 |

---

## Open Questions

> [!IMPORTANT]
> **Supabase connection string**: Do you already have a Supabase project with a `DATABASE_URL`? If yes, paste it into `.env` once created. If not, you'll need to create a free Supabase project at supabase.com and run `schema.sql` against it. I'll provide clear instructions in the README.

> [!IMPORTANT]
> **Demo passwords**: The seed will create 4 users. I'll set their plaintext passwords to memorable values (e.g., `admin123`, `sales123`, `warehouse123`, `accounts123`) — I'll document them in the README.

> [!NOTE]
> **Tailwind CSS version**: Will use Tailwind CSS v3 (stable, well-tested with Vite). Tailwind v4 has a different config format and is still stabilizing. Let me know if you want v4.

---

## Proposed Changes

### Phase 1 — Project Scaffolding

#### [NEW] `freightledger/.env.example`
#### [NEW] `freightledger/README.md`

---

### Phase 2 — Backend Foundation

#### [NEW] `backend/package.json` — dependencies: express, pg, bcryptjs, jsonwebtoken, pdfkit, express-validator, cors, dotenv, uuid; devDependencies: typescript, ts-node-dev, @types/*
#### [NEW] `backend/tsconfig.json` — strict mode, ES2022 target, outDir dist
#### [NEW] `backend/src/db.ts` — pg Pool singleton, typed query helper, `SELECT 1` health check
#### [NEW] `backend/sql/schema.sql` — full schema with ENUMs, all tables, all indexes
#### [NEW] `backend/sql/seed.sql` — 4 users, 15 customers, 20 products, 10 challans

---

### Phase 3 — Backend Middleware & Utils

#### [NEW] `backend/src/types/index.ts` — interfaces: User, Customer, Product, Challan, ChallanItem, StockMovement, PaginatedResponse, AppError
#### [NEW] `backend/src/middleware/authMiddleware.ts` — verifies Bearer JWT, attaches `req.user`
#### [NEW] `backend/src/middleware/requireRole.ts` — factory: `requireRole('ADMIN','SALES')` → 403 if not authorized
#### [NEW] `backend/src/middleware/errorHandler.ts` — global Express error handler, formats `{ statusCode, message, error, details? }`
#### [NEW] `backend/src/middleware/validate.ts` — wraps express-validator's `validationResult`, throws AppError on failure
#### [NEW] `backend/src/utils/pagination.ts` — parses `page`/`limit` from query, returns `{ offset, limit }` + builds meta
#### [NEW] `backend/src/utils/generateChallanNumber.ts` — atomic `UPDATE challan_counters ... RETURNING last_no` inside caller's transaction, formats `CH-YYYY-000042`

---

### Phase 4 — Auth Module

#### [NEW] `backend/src/auth/auth.routes.ts`
#### [NEW] `backend/src/auth/auth.controller.ts`

Routes:
- `POST /api/auth/signup` — admin-only in practice; bcrypt.hash password, INSERT user
- `POST /api/auth/login` — bcrypt.compare, sign JWT (payload: id, email, role, name)
- `GET /api/auth/me` — authMiddleware, return req.user

---

### Phase 5 — Customers Module

#### [NEW] `backend/src/customers/customers.routes.ts`
#### [NEW] `backend/src/customers/customers.controller.ts`

Routes with role guards:
- `GET /api/customers` — ADMIN, SALES, ACCOUNTS — search/status/type filters, paginated
- `GET /api/customers/:id` — same
- `POST /api/customers` — ADMIN, SALES
- `PATCH /api/customers/:id` — ADMIN, SALES; auto-updates `updated_at`
- `POST /api/customers/:id/follow-ups` — ADMIN, SALES
- `GET /api/customers/:id/follow-ups` — ADMIN, SALES, ACCOUNTS

---

### Phase 6 — Products Module

#### [NEW] `backend/src/products/products.routes.ts`
#### [NEW] `backend/src/products/products.controller.ts`

Routes:
- `GET /api/products` — all roles — search/category/lowStock filters, paginated
- `GET /api/products/:id` — all roles
- `POST /api/products` — ADMIN, WAREHOUSE
- `PATCH /api/products/:id` — ADMIN, WAREHOUSE (price/name changes don't affect existing challan snapshots)
- `GET /api/products/:id/movements` — all roles, paginated
- `POST /api/products/:id/movements` — ADMIN, WAREHOUSE — manual stock adjustment, always paired with stock_movement row

---

### Phase 7 — Challans Module (most complex)

#### [NEW] `backend/src/challans/challans.routes.ts`
#### [NEW] `backend/src/challans/challans.controller.ts`
#### [NEW] `backend/src/challans/invoicePdf.ts`

Routes:
- `GET /api/challans` — ADMIN, SALES, ACCOUNTS, WAREHOUSE(read)
- `GET /api/challans/:id` — same
- `POST /api/challans` — ADMIN, SALES — creates DRAFT
- `PATCH /api/challans/:id` — ADMIN, SALES — only while DRAFT
- `POST /api/challans/:id/confirm` — **transactional**: BEGIN → lock product rows FOR UPDATE → check all stock → if any short ROLLBACK 409 → UPDATE stock → INSERT movements → UPDATE challan → COMMIT
- `POST /api/challans/:id/cancel` — **transactional**: if was CONFIRMED, restock items with IN movements
- `GET /api/challans/:id/invoice.pdf` — ADMIN, ACCOUNTS, SALES(own)

---

### Phase 8 — Backend Server Entry

#### [NEW] `backend/src/server.ts` — Express app setup, all routes mounted, error handler last, listen on PORT

---

### Phase 9 — Frontend Foundation

#### [NEW] `frontend/package.json`
#### [NEW] `frontend/vite.config.js` — proxy `/api` → `http://localhost:5000`
#### [NEW] `frontend/tailwind.config.js` — extend theme with FreightLedger tokens
#### [NEW] `frontend/index.html` — Google Fonts: Space Grotesk, IBM Plex Sans, IBM Plex Mono
#### [NEW] `frontend/src/theme/tokens.js` — all design tokens as JS constants

---

### Phase 10 — Frontend Lib & Store

#### [NEW] `frontend/src/lib/api.js` — fetch wrapper: base URL from env, injects `Authorization: Bearer <token>` from Zustand, throws on non-2xx
#### [NEW] `frontend/src/lib/queryClient.js` — TanStack QueryClient instance
#### [NEW] `frontend/src/store/authStore.js` — Zustand: `{ user, token, login, logout }`, persisted to localStorage

---

### Phase 11 — UI Components

#### [NEW] `frontend/src/components/layout/AppShell.jsx` — two-column layout (sidebar + main)
#### [NEW] `frontend/src/components/layout/LedgerSidebar.jsx` — ledger-book-spine nav with signal-amber active tab, icons
#### [NEW] `frontend/src/components/layout/TopBar.jsx` — module title, search slot, user avatar + role badge
#### [NEW] `frontend/src/components/ui/DataTable.jsx` — reusable table: columns config, loading skeleton, empty state
#### [NEW] `frontend/src/components/ui/Drawer.jsx` — right-slide 200ms, backdrop, close on Escape
#### [NEW] `frontend/src/components/ui/StatusStamp.jsx` — rubber-stamp badge: rotated -4deg, double border, stamp-impact animation
#### [NEW] `frontend/src/components/ui/SearchInput.jsx`
#### [NEW] `frontend/src/components/ui/Pagination.jsx`

---

### Phase 12 — Feature: Auth

#### [NEW] `frontend/src/features/auth/LoginPage.jsx` — full-screen ink bg, FreightLedger wordmark, form
#### [NEW] `frontend/src/features/auth/useAuth.js` — TanStack Query mutation for login

---

### Phase 13 — Feature: Customers

#### [NEW] `frontend/src/features/customers/CustomersListPage.jsx`
#### [NEW] `frontend/src/features/customers/CustomerDetailPage.jsx`
#### [NEW] `frontend/src/features/customers/CustomerFormDrawer.jsx`
#### [NEW] `frontend/src/features/customers/FollowUpTimeline.jsx`
#### [NEW] `frontend/src/features/customers/useCustomers.js`

---

### Phase 14 — Feature: Products

#### [NEW] `frontend/src/features/products/ProductsListPage.jsx` — low-stock amber badge
#### [NEW] `frontend/src/features/products/ProductFormDrawer.jsx`
#### [NEW] `frontend/src/features/products/StockMovementLog.jsx`
#### [NEW] `frontend/src/features/products/useProducts.js`

---

### Phase 15 — Feature: Challans

#### [NEW] `frontend/src/features/challans/ChallansListPage.jsx`
#### [NEW] `frontend/src/features/challans/ChallanBuilderPage.jsx` — product search + line items, running total
#### [NEW] `frontend/src/features/challans/ChallanDetailPage.jsx` — confirm/cancel actions, PDF download
#### [NEW] `frontend/src/features/challans/StampBadge.jsx` — the signature stamp-impact animation on confirm
#### [NEW] `frontend/src/features/challans/useChallans.js`

---

### Phase 16 — App Entry

#### [NEW] `frontend/src/App.jsx` — React Router, ProtectedRoute, role-based redirects
#### [NEW] `frontend/src/main.jsx` — QueryClientProvider, Zustand, render

---

## Design System Reference

| Token | Hex | Use |
|---|---|---|
| `ink` | `#12151B` | Primary background |
| `ink-raised` | `#1B2029` | Card/panel surface |
| `steel` | `#2B3240` | Borders, dividers |
| `paper` | `#EDE6D6` | Stamp badges, receipt panels |
| `signal-amber` | `#F2A93B` | CTAs, active nav, focus rings |
| `ledger-green` | `#3F9967` | Confirmed / in-stock |
| `rust-alert` | `#C4501F` | Cancelled / stock-out |
| `slate-text` | `#C7CCD6` | Body text on dark |

Fonts: Space Grotesk (headers), IBM Plex Sans (body), IBM Plex Mono (all numeric/code data)

---

## Verification Plan

### Automated
- `GET /api/health` → 200 `{ status: 'ok' }`
- Auth flow: signup → login → GET /me
- Stock transaction: confirm challan → verify stock decremented; attempt over-stock → 409

### Manual
- Run `schema.sql` + `seed.sql` against Supabase
- Start backend: `npm run dev` in `/backend`
- Start frontend: `npm run dev` in `/frontend`
- Log in as each of the 4 demo users and verify role restrictions
- Confirm a challan → watch stock update
- Cancel a confirmed challan → watch stock restore
- Download invoice PDF
- Check UI at 375px, 768px, 1280px
