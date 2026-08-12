import axios from 'axios';

const authApiUrl = import.meta.env.VITE_AUTH_API_URL;

if (!authApiUrl) {
  throw new Error('VITE_AUTH_API_URL is not configured');
}

const AUTH_API = axios.create({
  baseURL: authApiUrl,
  headers: { 'Content-Type': 'application/json' }
});

const businessApiUrl = import.meta.env.VITE_BUSINESS_API_URL;

if (!businessApiUrl) {
  throw new Error('VITE_BUSINESS_API_URL is not configured');
}

const BUSINESS_API = axios.create({
  baseURL: businessApiUrl,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests. 403 from business-api usually means JWT invalid, expired,
// or backend (Spring Boot) JWT secret/issuer/audience don't match AuthService (.NET).
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const hadToken = !!localStorage.getItem('token');
        const url = error.config?.url || '';
        const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');

        // Only force-redirect when an authenticated session becomes invalid.
        // For login/register we want the page to display the API error message.
        if (hadToken && !isAuthCall) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(AUTH_API);
addAuthInterceptor(BUSINESS_API);

export { AUTH_API, BUSINESS_API };