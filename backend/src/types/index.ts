// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript interfaces — used across controllers and middleware
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

// ── Domain Models (shapes returned from the DB) ────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  [key: string]: unknown;
}

// Safe user — never include password_hash in API responses
export type SafeUser = Omit<User, 'password_hash'>;

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  business_name: string | null;
  gst_number: string | null;
  type: CustomerType;
  address: string | null;
  status: CustomerStatus;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface FollowUp {
  id: string;
  customer_id: string;
  note: string;
  created_by: string;
  created_at: string;
  created_by_name?: string; // joined from users
  [key: string]: unknown;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_price: string; // NUMERIC comes back as string from pg
  stock: number;
  min_stock: number;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  low_stock?: boolean; // computed field
  [key: string]: unknown;
}

export interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  type: MovementType;
  reason: string;
  created_by: string;
  created_at: string;
  created_by_name?: string; // joined from users
  [key: string]: unknown;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI';

export interface Payment {
  id: string;
  challan_id: string;
  customer_id: string;
  amount: string;
  payment_date: string;
  method: PaymentMethod;
  reference_number: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  [key: string]: unknown;
}

export interface Challan {
  id: string;
  challan_number: string;
  customer_id: string;
  total_quantity: number;
  subtotal: string;
  tax_rate: string;
  discount_amount: string;
  total_amount: string;
  status: ChallanStatus;
  created_by: string;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  customer_name?: string;    // joined
  created_by_name?: string;  // joined
  payment_status?: 'UNPAID' | 'PARTIAL' | 'PAID'; // computed
  [key: string]: unknown;
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price_snapshot: string; // NUMERIC → string from pg
  quantity: number;
  [key: string]: unknown;
}

// ── API Response Shapes ───────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── Error ──────────────────────────────────────────────────────────────────

export interface AppErrorPayload {
  statusCode: number;
  message: string;
  error?: string;
  details?: unknown;
}

export class AppError extends Error {
  public statusCode: number;
  public error: string;
  public details?: unknown;

  constructor(statusCode: number, message: string, error = 'Error', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ── JWT Payload ───────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ── Express augmentation — adds req.user ──────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
