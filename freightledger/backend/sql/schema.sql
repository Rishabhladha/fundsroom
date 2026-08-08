-- ============================================================
-- FreightLedger — Database Schema
-- Run this against your Supabase SQL Editor (or any Postgres DB)
-- Run schema.sql FIRST, then seed.sql
-- ============================================================

-- ── ENUMS ─────────────────────────────────────────────────────────────────────

CREATE TYPE role AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS');
CREATE TYPE customer_type AS ENUM ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR');
CREATE TYPE customer_status AS ENUM ('LEAD', 'ACTIVE', 'INACTIVE');
CREATE TYPE movement_type AS ENUM ('IN', 'OUT');
CREATE TYPE challan_status AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- ── USERS ─────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          role        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CUSTOMERS ─────────────────────────────────────────────────────────────────

CREATE TABLE customers (
  id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT            NOT NULL,
  mobile         TEXT            NOT NULL,
  email          TEXT,
  business_name  TEXT,
  gst_number     TEXT,
  type           customer_type   NOT NULL,
  address        TEXT,
  status         customer_status NOT NULL DEFAULT 'LEAD',
  follow_up_date DATE,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_name   ON customers (name);
CREATE INDEX idx_customers_mobile ON customers (mobile);
CREATE INDEX idx_customers_status ON customers (status);

-- ── FOLLOW UPS ────────────────────────────────────────────────────────────────

CREATE TABLE follow_ups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note        TEXT        NOT NULL,
  created_by  UUID        NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_follow_ups_customer ON follow_ups (customer_id);

-- ── PRODUCTS ──────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT         NOT NULL,
  sku         TEXT         NOT NULL UNIQUE,
  category    TEXT         NOT NULL,
  unit_price  NUMERIC(12,2) NOT NULL,
  stock       INTEGER      NOT NULL DEFAULT 0,
  min_stock   INTEGER      NOT NULL DEFAULT 0,
  location    TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_sku      ON products (sku);
CREATE INDEX idx_products_category ON products (category);

-- ── STOCK MOVEMENTS ───────────────────────────────────────────────────────────

CREATE TABLE stock_movements (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID          NOT NULL REFERENCES products(id),
  quantity    INTEGER       NOT NULL,
  type        movement_type NOT NULL,
  reason      TEXT          NOT NULL,
  created_by  UUID          NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_product ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_created ON stock_movements (created_at DESC);

-- ── CHALLAN COUNTERS ──────────────────────────────────────────────────────────
-- Atomic counter per year — avoids race conditions from COUNT(*)+1

CREATE TABLE challan_counters (
  year    INTEGER PRIMARY KEY,
  last_no INTEGER NOT NULL DEFAULT 0
);

-- ── CHALLANS ──────────────────────────────────────────────────────────────────

CREATE TABLE challans (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_number TEXT           NOT NULL UNIQUE,   -- e.g. CH-2026-000042
  customer_id    UUID           NOT NULL REFERENCES customers(id),
  total_quantity INTEGER        NOT NULL DEFAULT 0,
  status         challan_status NOT NULL DEFAULT 'DRAFT',
  created_by     UUID           NOT NULL REFERENCES users(id),
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT now(),
  confirmed_at   TIMESTAMPTZ,
  cancelled_at   TIMESTAMPTZ
);

CREATE INDEX idx_challans_status   ON challans (status);
CREATE INDEX idx_challans_customer ON challans (customer_id);
CREATE INDEX idx_challans_created  ON challans (created_at DESC);

-- ── CHALLAN ITEMS ─────────────────────────────────────────────────────────────
-- Snapshots product name/sku/price at time of sale — never retroactively changes

CREATE TABLE challan_items (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id            UUID          NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
  product_id            UUID          NOT NULL REFERENCES products(id),
  product_name_snapshot TEXT          NOT NULL,
  sku_snapshot          TEXT          NOT NULL,
  unit_price_snapshot   NUMERIC(12,2) NOT NULL,
  quantity              INTEGER       NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_challan_items_challan ON challan_items (challan_id);
CREATE INDEX idx_challan_items_product ON challan_items (product_id);
