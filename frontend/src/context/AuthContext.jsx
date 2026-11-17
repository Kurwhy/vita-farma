import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.getToken());
  const [user, setUser] = useState(() => (tokenStore.getToken() ? tokenStore.getUser() : null));
  const [ready, setReady] = useState(() => !tokenStore.getToken());

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
    setReady(true);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => clearSession();
    window.addEventListener('vitafarma:unauthorized', onUnauthorized);
    return () => window.removeEventListener('vitafarma:unauthorized', onUnauthorized);
  }, [clearSession]);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return undefined;
    }

    let cancelled = false;
    setReady(false);

    apiRequest('/me', { token })
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        tokenStore.setUser(data.user);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.status === 401 || error.status === 403) {
          clearSession();
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token, clearSession]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
        skipUnauthorized: true,
      });
      tokenStore.set(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
      setReady(true);
      return { ok: true, user: data.user };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/logout', { method: 'POST' });
    } catch {
      // Sesi tetap dibersihkan di peramban walau token sudah tidak berlaku.
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
