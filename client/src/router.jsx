import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import MyVehicles from './pages/customer/MyVehicles';
import RaiseQuery from './pages/customer/RaiseQuery';
import MyRepairs from './pages/customer/MyRepairs';
import RepairDetail from './pages/customer/RepairDetail';

// Shop Pages
import ShopDashboard from './pages/shop/Dashboard';
import ShopProfile from './pages/shop/ShopProfile';
import IncomingQueries from './pages/shop/IncomingQueries';
import ShopRepairs from './pages/shop/ShopRepairs';
import ShopRepairDetail from './pages/shop/ShopRepairDetail';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Customer Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/my-vehicles" element={<MyVehicles />} />
          <Route path="/raise-query" element={<RaiseQuery />} />
          <Route path="/my-repairs" element={<MyRepairs />} />
          <Route path="/my-repairs/:id" element={<RepairDetail />} />
        </Route>

        {/* Shop Owner Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['shop_owner']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/shop/dashboard" element={<ShopDashboard />} />
          <Route path="/shop/profile" element={<ShopProfile />} />
          <Route path="/shop/incoming" element={<IncomingQueries />} />
          <Route path="/shop/repairs" element={<ShopRepairs />} />
          <Route path="/shop/repairs/:id" element={<ShopRepairDetail />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
