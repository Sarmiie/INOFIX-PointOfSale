import { useState, useEffect } from 'react';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  // Fungsi untuk mendapatkan token dari storage
  const getToken = () => {
    try {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Gagal mengakses storage:', error);
      return null;
    }
  };

  // Fungsi untuk menyimpan token ke storage
  const setToken = (token) => {
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.warn('Gagal menyimpan ke localStorage:', error);
      try {
        if (token) {
          sessionStorage.setItem('auth_token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (sessionError) {
        console.error('Gagal menyimpan ke sessionStorage:', sessionError);
      }
    }
  };

  // Set Authorization header dengan token dari storage
  const setAuthHeader = () => {
    const token = getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Validasi sesi saat komponen mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        setIsValidating(true);
        const token = getToken();
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Set header sebelum request
        setAuthHeader();

        // Validasi token dengan endpoint /me
        const response = await api.get('/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
        setIsValidating(false);
      }
    };

    validateSession();
  }, []);

  // Fungsi login
  const login = async (email, password) => {
    try {
      setIsValidating(true);
      
      const response = await api.post('/login', { email, password });
      
      if (!response.data?.token) {
        throw new Error('Token tidak ditemukan di respons server');
      }

      const { token, user: userData } = response.data;
      
      console.log('Token diterima:', token.substring(0, 20) + '...');
      
      // Simpan token
      setToken(token);
      
      // Set user
      setUser(userData);
      
      console.log('Login berhasil, token tersimpan');
      
      return userData;
    } catch (error) {
      console.error('Error login:', error.message);
      setUser(null);
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  // Fungsi logout
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.warn('Warning logout dari server:', error.message);
    } finally {
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
  };

  return { user, loading, login, logout, setAuthHeader, isValidating, getToken };
}