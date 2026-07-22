import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // All requests go through the Vite proxy (/api → localhost:4000)
  // so the HttpOnly cookie is on the same origin and sent automatically
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      // keep existing session on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clean up any OAuth error param in URL (token is now a cookie, no ?token= needed)
    const params = new URLSearchParams(window.location.search);
    if (params.has('auth_error') || params.has('token')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    checkAuth();
  }, [checkAuth]);

  // Cookie is set by the server — frontend just records the user object in state
  const login = (userData) => setUser(userData);

  const logout = async () => {
    setUser(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
