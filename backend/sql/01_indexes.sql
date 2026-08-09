-- 01_indexes.sql
-- Run this in your Supabase SQL Editor to enable fast trigram searching

-- Enable the pg_trgm extension for fast text matching (ILIKE)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Customers: Fast search by name
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm 
ON customers USING GIN (name gin_trgm_ops);

-- Products: Fast search by name or sku
CREATE INDEX IF NOT EXISTS idx_products_search_trgm 
ON products USING GIN (name gin_trgm_ops, sku gin_trgm_ops);

-- Challans: Fast search by challan number
CREATE INDEX IF NOT EXISTS idx_challans_search_trgm 
ON challans USING GIN (challan_number gin_trgm_ops);
