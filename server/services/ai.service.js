const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');
const logger = require('../utils/logger');

let aiClient = null;

if (env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  } catch (e) {
    logger.warn('Failed to initialize Google Gemini client: ' + e.message);
  }
}

const analyzeBugReport = async (title, description) => {
  if (!aiClient) {
    return {
      summary: title.slice(0, 100),
      severity: 'Medium',
      priority: 'Medium',
      labels: ['bug', 'general'],
      rootCauses: ['Root cause requires active AI key to calculate.'],
      debuggingSteps: ['Check server application logs', 'Replicate with steps'],
      testCases: ['Verify normal form submission with valid parameters'],
    };
  }

  const prompt = `You are a Senior Principal QA & Software Architect. Analyze this bug report and output valid raw JSON only (no markdown wrapping, no extra keys):
Title: ${title}
Description: ${description}

Format:
{
  "summary": "Concise summary",
  "severity": "Low"|"Medium"|"High"|"Critical",
  "priority": "Low"|"Medium"|"High"|"Urgent",
  "labels": ["string", "string"],
  "rootCauses": ["string"],
  "debuggingSteps": ["string"],
  "testCases": ["string"]
}`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text.trim().replace(/^```json/g, '').replace(/```$/g, '');
    return JSON.parse(text);
  } catch (error) {
    logger.error('Gemini AI execution failed: ' + error.message);
    return {
      summary: title.slice(0, 100),
      severity: 'Medium',
      priority: 'Medium',
      labels: ['bug'],
      rootCauses: ['Failed to reach AI service; fallback defaults applied.'],
      debuggingSteps: ['Inspect local network and server logs.'],
      testCases: ['Re-test bug reproduction manually.'],
    };
  }
};

module.exports = { analyzeBugReport };