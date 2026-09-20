const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Token = require('../models/Token');
const { seedUsers, seedProjects, issueTemplates } = require('./seedData');
const { ACTIVITY_ACTIONS, NOTIFICATION_TYPES } = require('../config/constants');

const remoteScreenshots = [
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    fileName: 'server_crash_stack_trace.png',
    fileType: 'image/png',
    size: 245100,
  },
  {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    fileName: 'security_firewall_rejection.png',
    fileType: 'image/png',
    size: 184500,
  },
];

const seedDB = async () => {
  await connectDB();
  console.log('[SEED] Purging existing database collections safely...');

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Issue.deleteMany({}),
    Comment.deleteMany({}),
    ActivityLog.deleteMany({}),
    Notification.deleteMany({}),
    Token.deleteMany({}),
  ]);

  console.log('[SEED] Inserting users with bcrypt hashed passwords...');
  const commonPassword = 'Password123!';
  const createdUsers = [];

  for (const u of seedUsers) {
    const userDoc = new User({
      ...u,
      password: commonPassword,
    });
    await userDoc.save();
    createdUsers.push(userDoc);
  }

  const [adminUser, leadDev, backendDev, frontendDev, seniorQA, juniorQA] = createdUsers;
  const devGroup = [leadDev._id, backendDev._id, frontendDev._id];
  const allMembers = createdUsers.map((u) => u._id);

  console.log('[SEED] Inserting projects with enterprise members...');
  const createdProjects = [];
  for (const p of seedProjects) {
    const projectDoc = await Project.create({
      ...p,
      owner: adminUser._id,
      members: allMembers,
      issueCounter: 0,
    });
    createdProjects.push(projectDoc);
  }

  console.log('[SEED] Generating 21 enterprise issue tickets with complete relationships...');
  const createdIssues = [];

  for (let i = 0; i < 21; i++) {
    const template = issueTemplates[i % issueTemplates.length];
    const project = createdProjects[i % createdProjects.length];

    project.issueCounter += 1;
    await project.save();

    const issueKey = `${project.projectKey}-${project.issueCounter}`;
    const assignee = devGroup[i % devGroup.length];
    const reporter = i % 2 === 0 ? seniorQA._id : juniorQA._id;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + ((i % 5) - 2)); // Some overdue, some future

    const issueDoc = await Issue.create({
      issueKey,
      title: `[${template.labels[0].toUpperCase()}] ${template.title} (#${i + 1})`,
      description: template.description,
      project: project._id,
      reporter,
      assignee,
      severity: template.severity,
      priority: template.priority,
      status: template.status,
      labels: template.labels,
      browser: template.browser,
      operatingSystem: template.operatingSystem,
      stepsToReproduce: template.stepsToReproduce,
      expectedResult: template.expectedResult,
      actualResult: template.actualResult,
      attachments: i % 2 === 0 ? [remoteScreenshots[i % remoteScreenshots.length]] : [],
      dueDate,
      createdAt: new Date(Date.now() - (21 - i) * 3600 * 1000 * 8),
    });

    createdIssues.push(issueDoc);

    // Seed Activity Log
    await ActivityLog.create({
      actor: reporter,
      action: ACTIVITY_ACTIONS.CREATED,
      entityType: 'Issue',
      entityId: issueDoc._id,
      newValue: issueDoc,
      message: `Issue [${issueDoc.issueKey}] opened by QA team.`,
      createdAt: issueDoc.createdAt,
    });

    // Seed Comments
    if (i % 2 === 0) {
      const commentDoc = await Comment.create({
        issue: issueDoc._id,
        author: leadDev._id,
        content: `Investigating root cause now. @${seniorQA.name.split(' ')[0]} please provide test payloads.`,
        mentions: [seniorQA._id],
        createdAt: new Date(issueDoc.createdAt.getTime() + 1800000),
      });

      await ActivityLog.create({
        actor: leadDev._id,
        action: ACTIVITY_ACTIONS.COMMENT_ADDED,
        entityType: 'Issue',
        entityId: issueDoc._id,
        newValue: { commentId: commentDoc._id },
        message: `Engineering comment added by ${leadDev.name}.`,
        createdAt: commentDoc.createdAt,
      });
    }

    // Seed Notifications
    if (assignee) {
      await Notification.create({
        recipient: assignee,
        type: NOTIFICATION_TYPES.ISSUE_ASSIGNED,
        title: 'New Issue Assigned',
        message: `Assigned to [${issueDoc.issueKey}] ${issueDoc.title}`,
        relatedIssue: issueDoc._id,
        isRead: i > 10,
        createdAt: issueDoc.createdAt,
      });
    }
  }

  console.log('====================================================');
  console.log('DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log('DEFAULT CREDENTIALS FOR TESTING:');
  console.log('Common Password for all accounts: Password123!');
  console.log('----------------------------------------------------');
  console.log('Admin:      admin@bugboard.dev');
  console.log('Developer:  developer@bugboard.dev');
  console.log('Tester:     tester@bugboard.dev');
  console.log('====================================================');

  process.exit(0);
};

seedDB().catch((err) => {
  console.error('[SEED FATAL ERROR]', err);
  process.exit(1);
});