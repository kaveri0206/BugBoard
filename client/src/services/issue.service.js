/**
 * @file client/src/services/issue.service.js
 * @description Issue API service with universal response unpacking.
 */
import api from './api';

const extractIssues = (res) => {
  if (!res) return [];
  const body = res.data !== undefined ? res.data : res;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.issues)) return body.issues;
  if (Array.isArray(body?.data?.issues)) return body.data.issues;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

export const issueService = {
  getAll: async (params = {}) => {
    const response = await api.get('/issues', { params });
    const items = extractIssues(response);

    // Hybrid array/object envelope to support all component syntax
    const payload = [...items];
    payload.issues = items;
    payload.data = { issues: items };
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