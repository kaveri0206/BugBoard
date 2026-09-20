import api from './api';

export const aiService = {
  analyzeIssue: (data) => api.post('/ai/analyze-issue', data),
};