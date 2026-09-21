/**
 * @file client/src/services/ai.service.js
 * @description Gemini AI triage integration service.
 */
import api from './api';

export const aiService = {
  analyzeIssue: async ({ title, description }) => {
    return api.post('/telemetry/ai-triage', { title, description });
  },
};

export default aiService;