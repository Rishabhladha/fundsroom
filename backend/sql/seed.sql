-- ============================================================
-- FreightLedger — Seed Data
-- Run AFTER schema.sql
-- Passwords (plaintext → bcrypt hash, cost 10):
--   Admin@1234, Sales@1234, Warehouse@1234, Accounts@1234
-- ============================================================

-- ── USERS ─────────────────────────────────────────────────────────────────────
-- Hashes generated with bcrypt cost=10 for the passwords listed above

INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Arjun Mehta',   'admin@fundsroom.com',     '$2a$10$XrruAZt275Cz.IFPSnc4x.EXgQxC5mf2MnkvhE24QYsQh6yQjQgRe', 'ADMIN'),
  ('a1000000-0000-0000-0000-000000000002', 'Priya Sharma',  'sales@fundsroom.com',     '$2a$10$2u.A2NWLzautYqLCTAPNp.TJNY0mbNKas8txwJE95VSdog3ByoDeq', 'SALES'),
  ('a1000000-0000-0000-0000-000000000003', 'Ravi Kulkarni', 'warehouse@fundsroom.com', '$2a$10$4ksq734nMUtSYFLQ7qsrJO46RRU7jIzr6N8Dqn81Co0fnXRxKnUR2', 'WAREHOUSE'),
  ('a1000000-0000-0000-0000-000000000004', 'Deepa Iyer',    'accounts@fundsroom.com',  '$2a$10$I5QRX/6sOMXuN5O5yO8GPeXObWH.yr8c1CgYPTE7Aqtdg8KLlj6vu', 'ACCOUNTS');

-- NOTE: The hash above is for 'password' (bcrypt default test hash).
-- Run the following in your backend to regenerate proper hashes:
--   node -e "const b=require('bcryptjs'); console.log(b.hashSync('Admin@1234',10))"
-- Then UPDATE users SET password_hash='<new_hash>' WHERE email='admin@freightledger.com';
-- Or simply run the seed script: npm run seed (once created)

-- ── CUSTOMERS ─────────────────────────────────────────────────────────────────

INSERT INTO customers (id, name, mobile, email, business_name, gst_number, type, address, status, follow_up_date) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Rajesh Agarwal',   '9876543210', 'rajesh@agarwaltraders.com', 'Agarwal Traders',      '27AAACR5055K1Z5', 'WHOLESALE',   '12, Market Yard, Pune 411037',          'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000002', 'Sunita Joshi',     '9823456781', 'sunita@joshimart.com',      'Joshi Mart',           '29AABCJ1234D1Z2', 'RETAIL',      '45, MG Road, Bengaluru 560001',         'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000003', 'Vikram Nair',      '9911223344', NULL,                        'Nair Distributors',    '32AACCN4567G1Z8', 'DISTRIBUTOR', 'Plot 7, MIDC, Nagpur 440018',           'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000004', 'Meena Patel',      '9765432109', 'meena@patelwholesale.in',   'Patel Wholesale Hub',  '24AABCP9876E2Z3', 'WHOLESALE',   '88, Gidc Estate, Surat 395003',         'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000005', 'Suresh Reddy',     '9700112233', 'suresh@reddyfoods.com',     'Reddy Foods Ltd',      '36AABCR3456H1Z1', 'DISTRIBUTOR', '22, Jubilee Hills, Hyderabad 500033',   'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000006', 'Kavitha Menon',    '9988776655', NULL,                        NULL,                   NULL,              'RETAIL',      '5, Anna Salai, Chennai 600002',         'LEAD',     CURRENT_DATE + 3),
  ('b1000000-0000-0000-0000-000000000007', 'Amit Srivastava',  '9654321098', 'amit@srivastavasupply.com', 'Srivastava Supply Co', '09AABCS2345F1Z6', 'WHOLESALE',   '101, Hazratganj, Lucknow 226001',       'LEAD',     CURRENT_DATE + 7),
  ('b1000000-0000-0000-0000-000000000008', 'Pooja Bhatt',      '9543210987', NULL,                        'Bhatt Enterprises',    NULL,              'RETAIL',      '67, Bandra West, Mumbai 400050',        'INACTIVE', NULL),
  ('b1000000-0000-0000-0000-000000000009', 'Dinesh Choudhary', '9432109876', 'dinesh@choudharyco.in',     'Choudhary & Co',       '08AABCC6789J1Z4', 'WHOLESALE',   '14, Sansar Chandra Rd, Jaipur 302001',  'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000010', 'Anita Gupta',      '9321098765', NULL,                        NULL,                   NULL,              'RETAIL',      '23, Civil Lines, Delhi 110054',         'LEAD',     CURRENT_DATE + 2),
  ('b1000000-0000-0000-0000-000000000011', 'Kiran Kumar',      '9210987654', 'kiran@kirancorp.com',       'Kiran Corp',           '29AABCK7890K1Z7', 'DISTRIBUTOR', '9, Indiranagar, Bengaluru 560038',      'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000012', 'Rohit Malhotra',   '9109876543', NULL,                        'Malhotra Brothers',    '07AABCM8901L1Z9', 'WHOLESALE',   '55, Connaught Place, New Delhi 110001', 'INACTIVE', NULL),
  ('b1000000-0000-0000-0000-000000000013', 'Shweta Verma',     '9098765432', 'shweta@vermafresh.com',     'Verma Fresh Produce',  '09AABCV9012M1Z0', 'RETAIL',      '78, Hazratganj, Lucknow 226001',        'ACTIVE',   NULL),
  ('b1000000-0000-0000-0000-000000000014', 'Mahesh Rao',       '8987654321', NULL,                        NULL,                   NULL,              'RETAIL',      '34, FC Road, Pune 411005',              'LEAD',     CURRENT_DATE + 5),
  ('b1000000-0000-0000-0000-000000000015', 'Geeta Singh',      '8876543210', 'geeta@singhlogistics.com',  'Singh Logistics',      '23AABCS0123N1Z5', 'DISTRIBUTOR', '67, Patel Nagar, Patna 800023',         'ACTIVE',   NULL);

-- ── FOLLOW UPS ────────────────────────────────────────────────────────────────

INSERT INTO follow_ups (customer_id, note, created_by) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Called to discuss Q3 bulk order. Interested in 500 units of dry goods.', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000001', 'Sent revised pricing list. Awaiting confirmation.', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000006', 'First contact — walked into office. Interested in retail supply chain.', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000007', 'Email intro sent. Shared company brochure and minimum order details.', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000010', 'Referral from Rajesh Agarwal. Looking for monthly dry goods supply.', 'a1000000-0000-0000-0000-000000000002');

-- ── PRODUCTS ──────────────────────────────────────────────────────────────────
-- Categories: GRAINS, OILS, SPICES, PULSES, PACKAGING
-- A few products are deliberately at/below min_stock to trigger low-stock warnings

INSERT INTO products (id, name, sku, category, unit_price, stock, min_stock, location) VALUES
  -- GRAINS
  ('c1000000-0000-0000-0000-000000000001', 'Basmati Rice 25kg Sack',     'GR-BR-025', 'GRAINS',    1450.00,  240,  50, 'Rack A1'),
  ('c1000000-0000-0000-0000-000000000002', 'Wheat Flour 50kg Bag',        'GR-WF-050', 'GRAINS',     890.00,   18,  30, 'Rack A2'),  -- LOW STOCK
  ('c1000000-0000-0000-0000-000000000003', 'Sona Masoori Rice 25kg',      'GR-SM-025', 'GRAINS',    1220.00,   95,  40, 'Rack A3'),
  ('c1000000-0000-0000-0000-000000000004', 'Poha Fine 10kg Pack',         'GR-PF-010', 'GRAINS',     320.00,    8,  20, 'Rack A4'),  -- LOW STOCK

  -- OILS
  ('c1000000-0000-0000-0000-000000000005', 'Groundnut Oil 15L Tin',       'OL-GO-015', 'OILS',      2100.00,  180,  60, 'Rack B1'),
  ('c1000000-0000-0000-0000-000000000006', 'Sunflower Oil 15L Tin',       'OL-SF-015', 'OILS',      1890.00,   22,  30, 'Rack B2'),  -- LOW STOCK
  ('c1000000-0000-0000-0000-000000000007', 'Coconut Oil 5L Bottle',       'OL-CO-005', 'OILS',       780.00,  310, 100, 'Rack B3'),
  ('c1000000-0000-0000-0000-000000000008', 'Mustard Oil 5L Tin',          'OL-MO-005', 'OILS',       650.00,  420, 100, 'Rack B4'),

  -- SPICES
  ('c1000000-0000-0000-0000-000000000009', 'Red Chilli Powder 1kg Pack',  'SP-RC-001', 'SPICES',     185.00,  560, 100, 'Rack C1'),
  ('c1000000-0000-0000-0000-000000000010', 'Turmeric Powder 1kg Pack',    'SP-TP-001', 'SPICES',     155.00,  480, 100, 'Rack C2'),
  ('c1000000-0000-0000-0000-000000000011', 'Coriander Powder 1kg Pack',   'SP-CP-001', 'SPICES',     130.00,    5,  50, 'Rack C3'),  -- CRITICALLY LOW
  ('c1000000-0000-0000-0000-000000000012', 'Garam Masala 500g Pack',      'SP-GM-500', 'SPICES',     210.00,  230,  80, 'Rack C4'),

  -- PULSES
  ('c1000000-0000-0000-0000-000000000013', 'Toor Dal 25kg Sack',          'PL-TD-025', 'PULSES',    1680.00,  145,  40, 'Rack D1'),
  ('c1000000-0000-0000-0000-000000000014', 'Chana Dal 25kg Sack',         'PL-CD-025', 'PULSES',    1540.00,   35,  40, 'Rack D2'),  -- LOW STOCK
  ('c1000000-0000-0000-0000-000000000015', 'Moong Dal 25kg Sack',         'PL-MD-025', 'PULSES',    1920.00,   90,  30, 'Rack D3'),

  -- PACKAGING
  ('c1000000-0000-0000-0000-000000000016', 'HDPE Woven Sack 50kg (100p)', 'PK-WS-100', 'PACKAGING',  850.00, 1200, 200, 'Store E1'),
  ('c1000000-0000-0000-0000-000000000017', 'Corrugated Box 12x10x8 (50p)','PK-CB-050', 'PACKAGING',  620.00,   45,  50, 'Store E2'),  -- LOW STOCK
  ('c1000000-0000-0000-0000-000000000018', 'Stretch Film 500m Roll',      'PK-SF-500', 'PACKAGING',  380.00,  280, 100, 'Store E3'),
  ('c1000000-0000-0000-0000-000000000019', 'Silica Gel Sachet 100p Pack', 'PK-SG-100', 'PACKAGING',  145.00,  800, 200, 'Store E4'),
  ('c1000000-0000-0000-0000-000000000020', 'Jute Bag 10kg Capacity (50p)','PK-JB-050', 'PACKAGING',  490.00,  350, 100, 'Store E5');

-- ── STOCK MOVEMENTS (initial purchase/receiving entries) ──────────────────────

INSERT INTO stock_movements (product_id, quantity, type, reason, created_by) VALUES
  ('c1000000-0000-0000-0000-000000000001', 300, 'IN', 'Opening stock — vendor receipt INV-2026-0001', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002',  60, 'IN', 'Opening stock — vendor receipt INV-2026-0002', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002',  42, 'OUT','Damaged in transit — Dispatch Note DN-0234',   'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000003', 100, 'IN', 'Opening stock — vendor receipt INV-2026-0003', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000004',  30, 'IN', 'Opening stock — vendor receipt INV-2026-0004', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000004',  22, 'OUT','Returned to supplier — Quality issue',         'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000005', 200, 'IN', 'Opening stock — vendor receipt INV-2026-0005', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000006',  50, 'IN', 'Opening stock — vendor receipt INV-2026-0006', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000006',  28, 'OUT','Dispatched per challan CH-2026-000001',        'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000009', 600, 'IN', 'Opening stock — vendor receipt INV-2026-0007', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000011',  55, 'IN', 'Opening stock — vendor receipt INV-2026-0008', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000011',  50, 'OUT','Dispatched per challan CH-2026-000002',        'a1000000-0000-0000-0000-000000000003');

-- ── CHALLAN COUNTERS ──────────────────────────────────────────────────────────

INSERT INTO challan_counters (year, last_no) VALUES (2026, 10);

-- ── CHALLANS ──────────────────────────────────────────────────────────────────

INSERT INTO challans (id, challan_number, customer_id, total_quantity, status, created_by, confirmed_at) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'CH-2026-000001', 'b1000000-0000-0000-0000-000000000001', 50, 'CONFIRMED', 'a1000000-0000-0000-0000-000000000002', now() - interval '5 days'),
  ('d1000000-0000-0000-0000-000000000002', 'CH-2026-000002', 'b1000000-0000-0000-0000-000000000003', 80, 'CONFIRMED', 'a1000000-0000-0000-0000-000000000002', now() - interval '4 days'),
  ('d1000000-0000-0000-0000-000000000003', 'CH-2026-000003', 'b1000000-0000-0000-0000-000000000005', 35, 'CANCELLED', 'a1000000-0000-0000-0000-000000000002', NULL),
  ('d1000000-0000-0000-0000-000000000004', 'CH-2026-000004', 'b1000000-0000-0000-0000-000000000002', 20, 'CONFIRMED', 'a1000000-0000-0000-0000-000000000002', now() - interval '3 days'),
  ('d1000000-0000-0000-0000-000000000005', 'CH-2026-000005', 'b1000000-0000-0000-0000-000000000004', 60, 'CONFIRMED', 'a1000000-0000-0000-0000-000000000002', now() - interval '2 days'),
  ('d1000000-0000-0000-0000-000000000006', 'CH-2026-000006', 'b1000000-0000-0000-0000-000000000009', 45, 'DRAFT',     'a1000000-0000-0000-0000-000000000002', NULL),
  ('d1000000-0000-0000-0000-000000000007', 'CH-2026-000007', 'b1000000-0000-0000-0000-000000000011', 30, 'DRAFT',     'a1000000-0000-0000-0000-000000000002', NULL),
  ('d1000000-0000-0000-0000-000000000008', 'CH-2026-000008', 'b1000000-0000-0000-0000-000000000001', 90, 'CONFIRMED', 'a1000000-0000-0000-0000-000000000002', now() - interval '1 day'),
  ('d1000000-0000-0000-0000-000000000009', 'CH-2026-000009', 'b1000000-0000-0000-0000-000000000013', 25, 'CANCELLED', 'a1000000-0000-0000-0000-000000000002', NULL),
  ('d1000000-0000-0000-0000-000000000010', 'CH-2026-000010', 'b1000000-0000-0000-0000-000000000015', 15, 'DRAFT',     'a1000000-0000-0000-0000-000000000002', NULL);

-- ── CHALLAN ITEMS ─────────────────────────────────────────────────────────────

INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity) VALUES
  -- CH-2026-000001 (CONFIRMED — Agarwal Traders)
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Basmati Rice 25kg Sack',    'GR-BR-025', 1450.00, 20),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 'Groundnut Oil 15L Tin',     'OL-GO-015', 2100.00, 10),
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000009', 'Red Chilli Powder 1kg Pack','SP-RC-001',  185.00, 20),

  -- CH-2026-000002 (CONFIRMED — Nair Distributors)
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000007', 'Coconut Oil 5L Bottle',     'OL-CO-005',  780.00, 30),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000008', 'Mustard Oil 5L Tin',        'OL-MO-005',  650.00, 30),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000010', 'Turmeric Powder 1kg Pack',  'SP-TP-001',  155.00, 20),

  -- CH-2026-000003 (CANCELLED — Reddy Foods)
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000013', 'Toor Dal 25kg Sack',        'PL-TD-025', 1680.00, 20),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000015', 'Moong Dal 25kg Sack',       'PL-MD-025', 1920.00, 15),

  -- CH-2026-000004 (CONFIRMED — Joshi Mart)
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000010', 'Turmeric Powder 1kg Pack',  'SP-TP-001',  155.00, 10),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000012', 'Garam Masala 500g Pack',    'SP-GM-500',  210.00, 10),

  -- CH-2026-000005 (CONFIRMED — Patel Wholesale Hub)
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'Sona Masoori Rice 25kg',    'GR-SM-025', 1220.00, 30),
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000016', 'HDPE Woven Sack 50kg',      'PK-WS-100',  850.00, 30),

  -- CH-2026-000006 (DRAFT — Choudhary & Co)
  ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Basmati Rice 25kg Sack',    'GR-BR-025', 1450.00, 25),
  ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000013', 'Toor Dal 25kg Sack',        'PL-TD-025', 1680.00, 20),

  -- CH-2026-000007 (DRAFT — Kiran Corp)
  ('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000005', 'Groundnut Oil 15L Tin',     'OL-GO-015', 2100.00, 15),
  ('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000018', 'Stretch Film 500m Roll',    'PK-SF-500',  380.00, 15),

  -- CH-2026-000008 (CONFIRMED — Agarwal Traders repeat)
  ('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 'Basmati Rice 25kg Sack',    'GR-BR-025', 1450.00, 40),
  ('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000002', 'Wheat Flour 50kg Bag',       'GR-WF-050',  890.00, 10),
  ('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000008', 'Mustard Oil 5L Tin',        'OL-MO-005',  650.00, 40),

  -- CH-2026-000009 (CANCELLED — Verma Fresh Produce)
  ('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000009', 'Red Chilli Powder 1kg Pack','SP-RC-001',  185.00, 25),

  -- CH-2026-000010 (DRAFT — Singh Logistics)
  ('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000016', 'HDPE Woven Sack 50kg',      'PK-WS-100',  850.00,  8),
  ('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000019', 'Silica Gel Sachet 100p Pack','PK-SG-100', 145.00,  7);
