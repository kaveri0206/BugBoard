/**
 * @file client/src/services/analytics.service.js
 * @description Axios service calls for analytics and velocity metrics.
 */

import api from './api';

export const analyticsService = {
  getMetrics: () => api.get('/analytics'),
};

export default analyticsService;