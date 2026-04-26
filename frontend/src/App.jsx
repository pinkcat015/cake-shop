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
import AdminProducts from './pages/admin/AdminProducts';
import EmployeeProducts from './pages/employee/EmployeeProducts';

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
            <Route path="/register" element={<Register />} />
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
