import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
});

let isLoggingOut = false;

// Interceptor request - Debug setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Jika bukan FormData, set Content-Type ke application/json
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  } else {
    // Hapus Content-Type untuk FormData, browser akan set otomatis
    delete config.headers['Content-Type'];
  }

  return config;
});

// Interceptor response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401 && !isLoggingOut) {
      const isAuthEndpoint = error.config.url?.includes('/me') || error.config.url?.includes('/login');
      
      if (isAuthEndpoint) {
        console.warn('Token invalid atau expired');
        isLoggingOut = true;
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
        
        setTimeout(() => {
          window.location.href = '/login';
          isLoggingOut = false;
        }, 500);
      }
    }
    return Promise.reject(error);
  }
);

export default api;