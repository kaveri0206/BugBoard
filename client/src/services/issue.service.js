import api from './api';

export const issueService = {
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  changeStatus: (id, status) => api.patch(`/issues/${id}/status`, { status }),
  assign: (id, assigneeId) => api.patch(`/issues/${id}/assign`, { assigneeId }),
  checkDuplicates: (data) => api.post('/issues/check-duplicates', data),
};