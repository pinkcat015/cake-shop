import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/public/Home';
import Login from './pages/public/auth/Login';
import Register from './pages/public/auth/Register';
import Profile from './pages/user/Profile';
import Products from './pages/public/Products';
import CategoryProducts from './pages/public/CategoryProducts';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import Orders from './pages/public/Orders';
import Stores from './pages/public/Stores';
import StoreDetail from './pages/public/StoreDetail';
import AdminProducts from './pages/admin/AdminProducts';
import EmployeeProducts from './pages/employee/EmployeeProducts';
import FloatingCart from './components/FloatingCart';
import CartFlightOverlay from './components/CartFlightOverlay';
import AdminStores from './pages/admin/AdminStores';
import ForgotPassword from './pages/public/auth/ForgotPassword';
import ResetPassword from './pages/public/auth/ResetPassword';
import VerifyEmail from './pages/public/auth/VerifyEmail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminVouchers from './pages/admin/AdminVouchers';
import PaymentGateway from './pages/public/PaymentGateway';
import RegisterSuccess from './pages/public/auth/RegisterSuccess';
import ForgotSuccess from './pages/public/auth/ForgotSuccess';
import News from './pages/public/News';


const ProtectedRoute = ({ children, roles }) => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          fontFamily: 'Arial, sans-serif'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/category/:categoryName" element={<CategoryProducts />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/news" element={<News />} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/payment-gateway" element={<ProtectedRoute><PaymentGateway /></ProtectedRoute>} />
            <Route path="/locations" element={<Stores />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute roles={['admin', 'employee']}>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/vouchers" element={
              <ProtectedRoute roles={['admin']}>
                <AdminVouchers />
              </ProtectedRoute>
            } />
            <Route path="/admin/stores" element={
              <ProtectedRoute roles={['admin']}>
                <AdminStores />
              </ProtectedRoute>
            } />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/locations/:id" element={<StoreDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-success" element={<RegisterSuccess />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-success" element={<ForgotSuccess />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/products"
              element={
                <ProtectedRoute roles={['employee', 'admin']}>
                  <EmployeeProducts />
                </ProtectedRoute>
              }
            />
          </Routes>
          <FloatingCart />
          <CartFlightOverlay />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
