import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, clearToken } from '../api/httpClient.js';
import { fetchProfile, login as apiLogin } from '../api/vaultClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((payload) => {
    setProfile({
      email: payload.email,
      displayName: payload.displayName,
      authorId: payload.authorId,
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setProfile(null);
  }, []);

  const login = useCallback(async (email, password, remember = false) => {
    const data = await apiLogin(email, password);
    setToken(data.payload.token, remember);
    applySession(data.payload);
    return data.payload;
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchProfile();
        if (!cancelled && me) {
          applySession(me);
        } else if (!cancelled) {
          clearToken();
        }
      } catch {
        if (!cancelled) clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [applySession]);

  return (
    <AuthContext.Provider value={{ profile, loading, login, logout, applySession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
