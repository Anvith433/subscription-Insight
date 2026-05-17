import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8082/api' : '/api');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear storage and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionAPI = {
  getAll: () => api.get('/subscriptions'),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
  uploadCSV: (formData) =>
    api.post('/subscriptions/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Recommendations ───────────────────────────────────────────────────────────
export const recommendationAPI = {
  getAll: () => api.get('/recommendations'),
  dismiss: (id) => api.patch(`/recommendations/${id}/dismiss`),
};

// ── Billing / Payment Calendar ────────────────────────────────────────────────
export const billingAPI = {
  getAll: () => api.get('/billing'),
  getUpcoming: () => api.get('/billing/upcoming'),
};

// ── User Snapshots / Analytics ────────────────────────────────────────────────
export const snapshotAPI = {
  getLatest: () => api.get('/snapshots/latest'),
  getHistory: () => api.get('/snapshots'),
};

// ── Usage Tracking ────────────────────────────────────────────────────────────
export const usageAPI = {
  create: (data) => api.post('/usage', data),
  getMonthly: (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return api.get('/usage/monthly', { params });
  },
};

export default api;
