import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import CustomersListPage from './features/customers/CustomersListPage';
import CustomerDetailPage from './features/customers/CustomerDetailPage';
import ProductsListPage from './features/products/ProductsListPage';
import ChallansListPage from './features/challans/ChallansListPage';
import ChallanBuilderPage from './features/challans/ChallanBuilderPage';
import ChallanDetailPage from './features/challans/ChallanDetailPage';
import StockLogPage from './features/products/StockLogPage';

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — redirects to /login if no token in Zustand store
// ─────────────────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// App — all routes
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/customers"
        element={<ProtectedRoute><CustomersListPage /></ProtectedRoute>}
      />
      <Route
        path="/customers/:id"
        element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>}
      />
      <Route
        path="/products"
        element={<ProtectedRoute><ProductsListPage /></ProtectedRoute>}
      />
      <Route
        path="/challans"
        element={<ProtectedRoute><ChallansListPage /></ProtectedRoute>}
      />
      <Route
        path="/challans/new"
        element={<ProtectedRoute><ChallanBuilderPage /></ProtectedRoute>}
      />
      <Route
        path="/challans/:id"
        element={<ProtectedRoute><ChallanDetailPage /></ProtectedRoute>}
      />
      <Route
        path="/stock-log"
        element={<ProtectedRoute><StockLogPage /></ProtectedRoute>}
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
