-- Add financial columns to challans
ALTER TABLE challans ADD COLUMN subtotal NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE challans ADD COLUMN tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE challans ADD COLUMN discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE challans ADD COLUMN total_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

-- Create payment method ENUM
CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI');

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challan_id UUID NOT NULL REFERENCES challans(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    method payment_method NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_challan ON payments (challan_id);
CREATE INDEX idx_payments_customer ON payments (customer_id);
CREATE INDEX idx_payments_date ON payments (payment_date DESC);
