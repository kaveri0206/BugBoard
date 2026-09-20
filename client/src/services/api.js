import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bugboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 cleanly without breaking public routes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const isAuthCall =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/me');

      const refreshToken = localStorage.getItem('bugboard_refresh_token');

      // Only attempt refresh if it wasn't an auth route call itself
      if (refreshToken && !isAuthCall) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
            { refreshToken }
          );
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('bugboard_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('bugboard_token');
          localStorage.removeItem('bugboard_refresh_token');
          localStorage.removeItem('bugboard_user');

          // Only redirect if NOT on public pages
          const currentPath = window.location.pathname;
          if (
            currentPath !== '/' &&
            !currentPath.startsWith('/login') &&
            !currentPath.startsWith('/register') &&
            !currentPath.startsWith('/forgot-password') &&
            !currentPath.startsWith('/reset-password')
          ) {
            window.location.href = '/login';
          }
        }
      } else {
        localStorage.removeItem('bugboard_token');
        localStorage.removeItem('bugboard_refresh_token');
        localStorage.removeItem('bugboard_user');

        // Never redirect to /login if user is on the Homepage ('/')
        const currentPath = window.location.pathname;
        if (
          currentPath !== '/' &&
          !currentPath.startsWith('/login') &&
          !currentPath.startsWith('/register') &&
          !currentPath.startsWith('/forgot-password') &&
          !currentPath.startsWith('/reset-password')
        ) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;