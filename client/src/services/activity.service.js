/**
 * @file activity.service.js
 * @description API service calls for global audit records and issue-specific activity logs.
 */

import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const getAll = (params) => api.get('/activities', { params, ...getAuthHeaders() });
const getIssueActivities = (issueId) => api.get(`/activities/issue/${issueId}`, getAuthHeaders());

export const activityService = {
  getAll,
  getActivities: getAll,
  getAllActivities: getAll,
  getIssueActivities,
  getByIssue: getIssueActivities,
};

export default activityService;