import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const apiBaseURL = configuredApiUrl
  ? `${configuredApiUrl.replace(/(?:\/api)+$/i, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tripmate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't loop redirect if already on login or register
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')
      ) {
        localStorage.removeItem('tripmate_token');
        localStorage.removeItem('tripmate_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
