/**
 * @file issue.service.js
 */
import api from './api'; // or axios

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const issueService = {
  getAll: (params) => api.get('/issues', { params, ...getAuthHeaders() }),
  getById: (id) => api.get(`/issues/${id}`, getAuthHeaders()),
  create: (data) => api.post('/issues', data, getAuthHeaders()),
  update: (id, data) => api.put(`/issues/${id}`, data, getAuthHeaders()),
  changeStatus: (id, status) => api.patch(`/issues/${id}/status`, { status }, getAuthHeaders()),
};