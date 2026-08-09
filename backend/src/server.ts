import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthCheck } from './db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './auth/auth.routes';
import customerRoutes from './customers/customers.routes';
import productRoutes from './products/products.routes';
import challanRoutes from './challans/challans.routes';
import paymentRoutes from './payments/payments.routes';
import stockRoutes from './stock/stock.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  const dbOk = await healthCheck();
  if (dbOk) {
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stock-movements', stockRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ statusCode: 404, message: 'Route not found', error: 'NotFound' });
});

// ── Global error handler (must be last) ─────────────────────────────────────

app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 FreightLedger API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
