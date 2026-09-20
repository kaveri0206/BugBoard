import api from './api';

export const activityService = {
  getIssueActivities: (issueId) => api.get(`/activities/issue/${issueId}`),
  getAuditLogs: (params) => api.get('/activities/audit-log', { params }),
};