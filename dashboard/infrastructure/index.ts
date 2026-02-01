import axios from "axios";

// Use environment variable or fallback to localhost for development
const baseURL = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4200';

export const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor for authentication token
instance.interceptors.request.use(
  (config) => {
    // In browser, get token from cookie
    if (typeof window !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Export axios instance as named export
export { instance as axios };

