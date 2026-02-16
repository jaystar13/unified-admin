import axios from 'axios';

const TOKEN_KEY = 'accessToken';

const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || '/api/playerslog',
  headers: {
    'Content-Type': 'application/json',
  },
});

authApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    console.error('Auth API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default authApiClient;
