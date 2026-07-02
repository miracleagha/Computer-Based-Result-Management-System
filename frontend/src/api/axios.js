import ax from 'axios';

// ─── Base URL ────────────────────────────────────────────────────────────────
// Switch between local dev and Render by changing this one line.
// Local:  'http://localhost:5000'
// Render: 'https://your-app-name.onrender.com'
// export const API_URL = 'http://localhost:5000';
export const API_URL = 'https://computer-based-result-management-system.onrender.com';
// ─────────────────────────────────────────────────────────────────────────────

const axios = ax.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Attach access token to every request ──────────────────────────────────
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Refresh-lock: prevents multiple simultaneous refresh calls ─────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Redirect helper — students use a different login page ─────────────────
const redirectToLogin = () => {
  const role = (() => {
    try {
      // Try to read role from the stored user object if available
      const raw = localStorage.getItem('user');
      if (raw) return JSON.parse(raw)?.role;
    } catch {
      // ignore
    }
    return null;
  })();

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  window.location.href = role === 'student' ? '/student-login' : '/login';
};

// ── Auto-refresh access token on 401 ──────────────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // No refresh token at all — send straight to login
      redirectToLogin();
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request until it finishes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await ax.post(`${API_URL}/api/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Update default header so queued requests use the new token
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axios;
