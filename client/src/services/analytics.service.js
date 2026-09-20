import api from './api';

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMetrics: () => api.get('/analytics/metrics'),
};