import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';

const BACKEND_URL = 'http://192.168.18.23:5000/api/auth';
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      const storedUser = await SecureStore.getItemAsync('userData');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback: check Supabase session if migrated from partial SSO
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await syncSso(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        }
      }
    } catch (e) {
      console.log('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  const syncBackend = async (data) => {
    setUser(data.user);
    setToken(data.token);
    await SecureStore.setItemAsync('userToken', data.token);
    await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
  };

  const login = async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await syncBackend(data);
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await syncBackend(data);
  };

  const syncSso = async (id, email, name, avatar) => {
    const res = await fetch(`${BACKEND_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, name, avatar })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await syncBackend(data);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    setUser(null);
    setToken(null);
    await supabase.auth.signOut(); // Clear OAuth if it existed
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, syncSso, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
