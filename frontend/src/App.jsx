import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import SellerBrowse from './pages/seller/Browse';
import SellerOrders from './pages/seller/MyOrders';

function ProtectedRoute({ children, requiredRole }) {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/seller'} replace />;
  }
  return children;
}

export default function App() {
  const { token, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token && user
              ? <Navigate to={user.role === 'admin' ? '/admin' : '/seller'} replace />
              : <Login />
          }
        />
        <Route
          path="/admin"
          element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/products"
          element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>}
        />
        <Route
          path="/admin/orders"
          element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>}
        />
        <Route
          path="/seller"
          element={<ProtectedRoute requiredRole="seller"><SellerBrowse /></ProtectedRoute>}
        />
        <Route
          path="/seller/orders"
          element={<ProtectedRoute requiredRole="seller"><SellerOrders /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
