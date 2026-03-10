import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { getToken, setToken } from '../api/client';

const AuthContext = createContext(null);
const USER_KEY = '@consorcio_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getToken().then((t) => {
      if (!t || cancelled) {
        setLoading(false);
        return;
      }
      api('/auth/me')
        .then((data) => {
          if (!cancelled) {
            setUser(data);
            AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUser(null);
            setToken(null);
            AsyncStorage.removeItem(USER_KEY);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setToken(token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = async () => {
    await setToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
