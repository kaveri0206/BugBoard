/**
 * @file client/src/services/issue.service.js
 * @description Issue API service with universal response unpacking.
 */
import api from './api';

// Helper to extract issues array regardless of backend wrapper structure
const unpackIssuesResponse = (res) => {
  const d = res?.data;
  let items = [];

  if (Array.isArray(d)) {
    items = d;
  } else if (Array.isArray(d?.issues)) {
    items = d.issues;
  } else if (Array.isArray(d?.data?.issues)) {
    items = d.data.issues;
  } else if (Array.isArray(d?.data)) {
    items = d.data;
  } else if (Array.isArray(d?.items)) {
    items = d.items;
  }

  // Preserve both direct array access and object envelope properties
  return {
    ...res,
    data: {
      success: true,
      issues: items,
      data: { issues: items },
      items: items,
      total: items.length,
      count: items.length,
      ...(typeof d === 'object' ? d : {}),
    },
  };
};

export const issueService = {
  getAll: async (params = {}) => {
    const res = await api.get('/issues', { params });
    return unpackIssuesResponse(res);
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