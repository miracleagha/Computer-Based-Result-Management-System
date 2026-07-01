import ax from 'axios';

// ─── Base URL ────────────────────────────────────────────────────────────────
// Switch between local dev and Render by changing this one line.
// Local:  'http://localhost:5000'
// Render: 'https://your-app-name.onrender.com'
export const API_URL = 'http://localhost:5000';
// export const API_URL = 'https://computer-based-result-management-system.onrender.com';
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

// ── Auto-refresh access token on 401 ──────────────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await ax.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axios;
