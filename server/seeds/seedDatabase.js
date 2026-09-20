/**
 * @file seedDatabase.js
 * @description Enterprise database seeder.
 * Wipes prior state and populates consistent accounts, projects, numbered issues,
 * audit activity logs, and notifications.
 */

const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Project = require('../models/Project');
const Issue = require('../models/Issue');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const {
  ROLES,
  PROJECT_STATUS,
  ISSUE_STATUS,
  ISSUE_PRIORITY,
  ISSUE_SEVERITY,
  ACTIVITY_ACTIONS,
  NOTIFICATION_TYPES,
} = require('../config/constants');

const seedDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('[DB] MongoDB Connected for Seeding');

    // 1. Purge existing collections safely
    console.log('[SEED] Purging existing database collections safely...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Issue.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 2. Insert Users (pass plain strings; User model handles hashing once)
    console.log('[SEED] Inserting users...');
    const users = await User.create([
      {
        name: 'Enterprise Admin',
        email: 'admin@bugboard.dev',
        password: 'Password123!',
        role: ROLES.ADMIN,
      },
      {
        name: 'Senior Developer',
        email: 'developer@bugboard.dev',
        password: 'Password123!',
        role: ROLES.DEVELOPER,
      },
      {
        name: 'Lead QA Engineer',
        email: 'tester@bugboard.dev',
        password: 'Password123!',
        role: ROLES.TESTER,
      },
      {
        name: 'Frontend Specialist',
        email: 'frontend@bugboard.dev',
        password: 'Password123!',
        role: ROLES.DEVELOPER,
      },
    ]);

    const admin = users[0];
    const dev = users[1];
    const tester = users[2];

    // 3. Insert Projects
    console.log('[SEED] Inserting projects with enterprise members...');
    const projects = await Project.create([
      {
        name: 'Payments & Checkout Engine',
        key: 'PAY',
        projectKey: 'PAY',
        description: 'Global checkout infrastructure, subscriptions, and webhooks.',
        status: PROJECT_STATUS.ACTIVE,
        lead: admin._id,
        members: [admin._id, dev._id, tester._id],
      },
      {
        name: 'Auth & Identity Gateway',
        key: 'AUTH',
        projectKey: 'AUTH',
        description: 'Single sign-on, JWT token refresh rotations, and OAuth2 services.',
        status: PROJECT_STATUS.ACTIVE,
        lead: admin._id,
        members: [admin._id, dev._id, tester._id],
      },
      {
        name: 'BugBoard Platform Core',
        key: 'CORE',
        projectKey: 'CORE',
        description: 'MERN dashboard UI, Gemini AI triage microservices, and audit feeds.',
        status: PROJECT_STATUS.ACTIVE,
        lead: admin._id,
        members: [admin._id, dev._id, tester._id],
      },
    ]);

    // 4. Sample Defect Templates
    const defectTemplates = [
      {
        title: 'Stripe webhook fails on duplicate idempotency key',
        description: 'Submitting duplicate payload returns 500 internal server error instead of 200/409 idempotent acknowledgment.',
        severity: ISSUE_SEVERITY.CRITICAL,
        priority: ISSUE_PRIORITY.URGENT,
        status: ISSUE_STATUS.OPEN,
        labels: ['payments', 'backend', 'stripe'],
      },
      {
        title: 'JWT Refresh token rotation memory leak on concurrent tabs',
        description: 'Rapidly opening multiple dashboard tabs invalidates the user session prematurely.',
        severity: ISSUE_SEVERITY.HIGH,
        priority: ISSUE_PRIORITY.HIGH,
        status: ISSUE_STATUS.IN_PROGRESS,
        labels: ['auth', 'security', 'jwt'],
      },
      {
        title: 'Gemini AI triage modal closes without saving user selection',
        description: 'Clicking backdrop dismisses dialog and discards predicted severity and test case outputs.',
        severity: ISSUE_SEVERITY.MEDIUM,
        priority: ISSUE_PRIORITY.MEDIUM,
        status: ISSUE_STATUS.TESTING,
        labels: ['ai', 'ui', 'react'],
      },
      {
        title: 'Export audit logs to CSV truncates multibyte UTF-8 characters',
        description: 'Special symbols inside user activity details render corrupted question marks.',
        severity: ISSUE_SEVERITY.LOW,
        priority: ISSUE_PRIORITY.LOW,
        status: ISSUE_STATUS.RESOLVED,
        labels: ['audit', 'export'],
      },
    ];

    // 5. Generate 21 Tickets with deterministic numeric sequential keys
    console.log('[SEED] Generating 21 enterprise issue tickets with complete relationships...');
    const insertedIssues = [];
    for (let i = 0; i < 21; i++) {
      const template = defectTemplates[i % defectTemplates.length];
      const targetProject = projects[i % projects.length];
      const issueSeq = Math.floor(i / projects.length) + 1;
      const prefix = targetProject.key;

      const issueDoc = await Issue.create({
        title: `${template.title} [Ref #${i + 1}]`,
        description: template.description,
        severity: template.severity,
        priority: template.priority,
        status: template.status,
        project: targetProject._id,
        reporter: tester._id,
        assignee: dev._id,
        labels: template.labels,
        issueNumber: issueSeq,
        issueKey: `${prefix}-${issueSeq}`,
        stepsToReproduce: '1. Navigate to target screen.\n2. Trigger payload.\n3. Inspect console logs.',
        expectedResult: 'System handles request gracefully.',
        actualResult: 'Defect reproduces reliably.',
      });

      insertedIssues.push(issueDoc);

      // Audit log entry
      await ActivityLog.create({
        action: ACTIVITY_ACTIONS.ISSUE_CREATED,
        user: tester._id,
        issue: issueDoc._id,
        project: targetProject._id,
        details: { issueKey: issueDoc.issueKey, status: issueDoc.status },
        message: `Issue ${issueDoc.issueKey} reported by QA`,
      });

      // Notification entry
      await Notification.create({
        recipient: dev._id,
        sender: tester._id,
        type: NOTIFICATION_TYPES.ISSUE_ASSIGNED,
        title: `Assigned: ${issueDoc.issueKey}`,
        message: `You have been assigned to investigate ticket ${issueDoc.issueKey}`,
        issue: issueDoc._id,
      });
    }

    console.log(`[SEED SUCCESS] Successfully seeded:
  - 4 Enterprise Users (admin@bugboard.dev, developer@bugboard.dev, tester@bugboard.dev)
  - 3 Active Projects (PAY, AUTH, CORE)
  - ${insertedIssues.length} Valid Defect Tickets with sequential non-NaN keys
  - Audit logs and notifications linked`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[SEED FATAL ERROR]', error);
    process.exit(1);
  }
};

seedDB();