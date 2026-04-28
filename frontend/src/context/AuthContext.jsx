import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

const TOKEN_KEY = 'token';

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

const getValidStoredToken = () => {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (!storedToken) return null;

  const payload = decodeJwtPayload(storedToken);
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (!payload || !payload.exp || payload.exp <= nowInSeconds) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  return storedToken;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getValidStoredToken);
  const payload = token ? decodeJwtPayload(token) : null;

  const user = token ? { token, role_name: payload?.role || null, user_id: payload?.user_id || null } : null;

  const login = (newToken) => {
    const newPayload = decodeJwtPayload(newToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (!newPayload || !newPayload.exp || newPayload.exp <= nowInSeconds) {
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
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