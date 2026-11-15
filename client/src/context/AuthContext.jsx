import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, setAccessToken } from '../lib/api.js';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState('loading');
  const [user, setUser] = useState(null);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await api.get('/auth/status', { auth: false });
      if (data.state === 'pin' || data.state === 'setup') {
        setUser(data.user || { username: data.username });
        setState(data.state);
      } else {
        setUser(null);
        setState('guest');
      }
    } catch {
      setUser(null);
      setState('guest');
    }
  }, []);

  useEffect(() => {
    refreshStatus();

    const handleUnauthorized = () => {
      setAccessToken(null);
      refreshStatus();
    };

    window.addEventListener('r2r:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('r2r:unauthorized', handleUnauthorized);
  }, [refreshStatus]);

  const login = useCallback(async (username, password) => {
    const data = await api.post('/auth/login', { username, password }, { auth: false });
    setUser(data.user);
    setState(data.state);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.post('/auth/register', payload, { auth: false });
    setUser(data.user);
    setState('setup');
    return data;
  }, []);

  const setupPin = useCallback(async (pin, confirmPin) => {
    const data = await api.post('/auth/pin/setup', { pin, confirmPin }, { auth: false });
    setAccessToken(data.token);
    setUser(data.user);
    setState('authed');
    return data;
  }, []);

  const verifyPin = useCallback(async (pin) => {
    const data = await api.post('/auth/pin/verify', { pin }, { auth: false });
    setAccessToken(data.token);
    setUser(data.user);
    setState('authed');
    return data;
  }, []);

  const resetPin = useCallback(async (payload) => {
    const data = await api.post('/auth/pin/reset', payload, { auth: false });
    setAccessToken(data.token);
    setUser(data.user);
    setState('authed');
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', undefined, { auth: false });
    } catch {
      /* cookie may already be gone */
    }
    setAccessToken(null);
    setUser(null);
    setState('guest');
  }, []);

  const value = useMemo(
    () => ({
      state,
      user,
      login,
      register,
      setupPin,
      verifyPin,
      resetPin,
      logout,
      refreshStatus,
    }),
    [state, user, login, register, setupPin, verifyPin, resetPin, logout, refreshStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
