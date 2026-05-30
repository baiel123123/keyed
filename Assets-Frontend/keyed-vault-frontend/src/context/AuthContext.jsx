import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
      () => localStorage.getItem('keyed_jwt') || sessionStorage.getItem('keyed_jwt') || null
  );

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('keyed_user') || sessionStorage.getItem('keyed_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((payload, remember = false) => {
    const t = payload?.token ?? null;
    const u = payload?.user ?? payload ?? null; // Если нет .user — сам payload и есть user

    const storage = remember ? localStorage : sessionStorage;
    if (t) storage.setItem('keyed_jwt', t);
    if (u) storage.setItem('keyed_user', JSON.stringify(u));

    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('keyed_jwt');
    localStorage.removeItem('keyed_user');
    sessionStorage.removeItem('keyed_jwt');
    sessionStorage.removeItem('keyed_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>. Wrap your app in AuthProvider.');
  }
  return ctx;
}