const transporter = require('../config/mailer');
const env = require('../config/env');
const logger = require('../utils/logger');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.info(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"BugBoard System" <${env.EMAIL_FROM}>`,
      to,
      subject,
      text: text || '',
      html,
    });
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
  }
};

const sendIssueAssignedNotification = async (user, issue) => {
  const html = `
    <h2>BugBoard Assignment Notification</h2>
    <p>Hello ${user.name},</p>
    <p>You have been assigned to issue <strong>[${issue.issueKey}] ${issue.title}</strong>.</p>
    <p>Priority: <strong>${issue.priority}</strong> | Severity: <strong>${issue.severity}</strong></p>
    <p><a href="${env.CLIENT_URL}/issues/${issue._id}">Click here to view the issue</a></p>
  `;
  await sendEmail({ to: user.email, subject: `[${issue.issueKey}] Assigned: ${issue.title}`, html });
};

module.exports = { sendEmail, sendIssueAssignedNotification };