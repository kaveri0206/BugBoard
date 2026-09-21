/**
 * @file client/src/services/issue.service.js
 * @description Issue API service with universal dual-mode array/object unpacking.
 */
import api from './api';

const extractIssues = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.issues)) return data.issues;
  if (Array.isArray(data?.data?.issues)) return data.data.issues;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const issueService = {
  getAll: async (params = {}) => {
    const response = await api.get('/issues', { params });
    const items = extractIssues(response.data);

    // Create a hybrid array/object payload to satisfy all component access patterns
    const payload = [...items];
    payload.issues = items;
    payload.data = items;
    payload.items = items;
    payload.total = items.length;
    payload.count = items.length;
    payload.success = true;

    return {
      ...response,
      data: payload,
    };
  },

  getById: async (id) => {
    return api.get(`/issues/${id}`);
  },

  create: async (data) => {
    return api.post('/issues', data);
  },

  update: async (id, data) => {
    return api.put(`/issues/${id}`, data);
  },

  changeStatus: async (id, status) => {
    return api.patch(`/issues/${id}/status`, { status });
  },
};

export default issueService;