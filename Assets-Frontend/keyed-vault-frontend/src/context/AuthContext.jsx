import { createContext, useContext, useState, useCallback} from 'react';

/* ─── Context ──────────────────────────────────────────────────── */
const AuthContext = createContext(null);

/* ─── Provider ─────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  // Rehydrate from storage on first load (handles "Remember me")
  const [token, setToken] = useState(
    () => localStorage.getItem('keyed_jwt')
      || sessionStorage.getItem('keyed_jwt')
      || null
  );

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('keyed_user')
               || sessionStorage.getItem('keyed_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Called by Login.jsx with the full backend payload
  // payload = { token: "...", user: { fullName, email, username, ... } }
  // remember = true  → localStorage  (persists across browser restarts)
  // remember = false → sessionStorage (cleared when tab closes)
  const login = useCallback((payload, remember = false) => {
    const t = payload?.token ?? null;
    const u = payload?.user  ?? null;

    const storage = remember ? localStorage : sessionStorage;
    if (t) storage.setItem('keyed_jwt',  t);
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

/* ─── Hook ─────────────────────────────────────────────────────── */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>. Wrap your app in AuthProvider.');
  }
  return ctx;
}