import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

const decodeJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
    const payload = atob(padded);
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const payload = token ? decodeJwtPayload(token) : null;

  const user = token ? { token, role_name: payload?.role || null, user_id: payload?.user_id || null } : null;

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    role: payload?.role || null,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};