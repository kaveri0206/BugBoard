import api from './api';

export const commentService = {
  getByIssue: (issueId) => api.get(`/comments/issue/${issueId}`),
  create: (issueId, data) => api.post(`/comments/issue/${issueId}`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};