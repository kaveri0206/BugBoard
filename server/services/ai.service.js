const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');
const logger = require('../utils/logger');

let aiClient = null;

if (env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    logger.info('Google Gemini AI initialized successfully.');
  } catch (e) {
    logger.warn('Failed to initialize Google Gemini client: ' + e.message);
  }
}

const analyzeBugReport = async (title, description) => {
  if (!aiClient) {
    return {
      summary: title ? title.slice(0, 100) : 'Bug triage overview',
      severity: 'Medium',
      priority: 'Medium',
      labels: ['bug'],
      rootCauses: ['Missing GEMINI_API_KEY in server/.env'],
      debuggingSteps: ['Inspect backend console logs'],
      testCases: ['Verify normal form submission with valid parameters'],
    };
  }

  const prompt = `You are a Principal Software Architect and Lead QA Engineer. 
Analyze the following defect report and respond with valid raw JSON only. 
Do not include any markdown backticks (\`\`\`json or \`\`\`), notes, or conversational text.

Bug Title: ${title}
Bug Description: ${description}

Required JSON schema:
{
  "summary": "1 to 2 sentence concise technical summary",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "labels": ["string", "string"],
  "rootCauses": ["probable architectural cause 1", "probable cause 2"],
  "debuggingSteps": ["step 1 to reproduce and inspect", "step 2"],
  "testCases": ["negative test condition 1", "boundary test condition 2"]
}`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const cleanJson = response.text.trim().replace(/^```json/g, '').replace(/```$/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    logger.error('Gemini AI execution failed: ' + error.message);
    return {
      summary: title ? title.slice(0, 100) : 'Defect report',
      severity: 'Medium',
      priority: 'Medium',
      labels: ['bug'],
      rootCauses: ['Gemini request error. Fallback applied.'],
      debuggingSteps: ['Check local application logs.'],
      testCases: ['Re-test manually.'],
    };
  }
};

const summarizeDiscussion = async (issueTitle, comments = []) => {
  if (!aiClient || !comments.length) {
    return 'No comments recorded on this issue yet.';
  }

  const conversationText = comments
    .map((c) => `${c.author?.name || 'User'}: ${c.content}`)
    .join('\n');

  const prompt = `Summarize the technical decisions and status of this bug thread in 3 concise bullet points:
Bug: ${issueTitle}
Discussion:
${conversationText}`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    logger.error('Thread summary failed: ' + error.message);
    return 'Unable to summarize discussion due to an upstream service error.';
  }
};

module.exports = { analyzeBugReport, summarizeDiscussion };