import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('lm_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall && localStorage.getItem('lm_token')) {
      window.dispatchEvent(new Event('lm:logout'));
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message || (e.request ? 'Cannot reach the server. Check your connection.' : 'Something went wrong. Please try again.');

export default api;
