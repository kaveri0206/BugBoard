const { ROLES, ISSUE_STATUS, ISSUE_SEVERITY, ISSUE_PRIORITY } = require('../config/constants');

const seedUsers = [
  {
    name: 'Eleanor Vance (Admin)',
    email: 'admin@bugboard.dev',
    role: ROLES.ADMIN,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Eleanor%20Vance',
  },
  {
    name: 'Marcus Brody (Lead Dev)',
    email: 'developer@bugboard.dev',
    role: ROLES.DEVELOPER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Marcus%20Brody',
  },
  {
    name: 'Elena Rostova (Backend Dev)',
    email: 'elena@bugboard.dev',
    role: ROLES.DEVELOPER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Elena%20Rostova',
  },
  {
    name: 'Kenji Sato (Frontend Dev)',
    email: 'kenji@bugboard.dev',
    role: ROLES.DEVELOPER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Kenji%20Sato',
  },
  {
    name: 'Sarah Connor (Senior QA)',
    email: 'tester@bugboard.dev',
    role: ROLES.TESTER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Sarah%20Connor',
  },
  {
    name: 'David Mills (QA Engineer)',
    email: 'david@bugboard.dev',
    role: ROLES.TESTER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=David%20Mills',
  },
];

const seedProjects = [
  {
    name: 'CloudScale Payment Gateway',
    projectKey: 'PAY',
    description: 'Core billing orchestration microservice handling PCI-compliant checkout flows and webhook relays.',
  },
  {
    name: 'AeroMobile Logistics iOS/Android',
    projectKey: 'AERO',
    description: 'Fleet driver companion app for real-time delivery telemetry, barcode scanning, and proof of dropoff.',
  },
  {
    name: 'Quantum Analytics Portal',
    projectKey: 'QAN',
    description: 'High-throughput time-series customer intelligence dashboard with OLAP data warehouse connectors.',
  },
];

const issueTemplates = [
  {
    title: 'Stripe webhook replay attack vulnerability in authorization interceptor',
    description: 'Idempotency key cache misses cause duplicate charge authorization when customer triggers rapid double-click on mobile 4G latency spikes.',
    severity: ISSUE_SEVERITY.CRITICAL,
    priority: ISSUE_PRIORITY.URGENT,
    status: ISSUE_STATUS.OPEN,
    labels: ['security', 'backend', 'payments'],
    browser: 'Chrome 124',
    operatingSystem: 'Ubuntu 22.04 LTS',
    stepsToReproduce: '1. Intercept checkout POST payload.\n2. Replay authorization with same timestamp header.\n3. Observe duplicate capture event in ledger.',
    expectedResult: 'System returns HTTP 409 Idempotency Conflict and drops duplicate charge token.',
    actualResult: 'Second transaction processed with unique checkout invoice ID.',
  },
  {
    title: 'JWT Token refresh rotation enters infinite loop on 401 response',
    description: 'When refresh token expires, Axios response interceptor does not abort retry queue, exhausting client CPU.',
    severity: ISSUE_SEVERITY.HIGH,
    priority: ISSUE_PRIORITY.HIGH,
    status: ISSUE_STATUS.IN_PROGRESS,
    labels: ['authentication', 'frontend', 'security'],
    browser: 'Firefox 125',
    operatingSystem: 'macOS Sonoma',
    stepsToReproduce: '1. Artificially clear refresh cookie.\n2. Trigger authenticated API request.\n3. Monitor Network Tab.',
    expectedResult: 'Client redirects cleanly to /login with session expired toast.',
    actualResult: 'Continuous recurring refresh requests fired until tab crashes.',
  },
  {
    title: 'PostgreSQL connection pool exhaustion during batch invoice generation',
    description: 'Invoice generator does not release database clients on worker timeout exceptions.',
    severity: ISSUE_SEVERITY.CRITICAL,
    priority: ISSUE_PRIORITY.HIGH,
    status: ISSUE_STATUS.TESTING,
    labels: ['database', 'performance', 'backend'],
    browser: 'Headless',
    operatingSystem: 'Debian 11',
    stepsToReproduce: 'Execute npm run test:load with concurrency > 250.',
    expectedResult: 'Connection pool throttles workers gracefully without socket resets.',
    actualResult: 'Server outputs ETIMEDOUT and hangs all active queries.',
  },
  {
    title: 'Kanban board card drag state breaks on Safari iOS touchscreen viewports',
    description: 'Touch event listeners fail to compute vertical scroll offsets accurately on iOS WebKit browsers.',
    severity: ISSUE_SEVERITY.MEDIUM,
    priority: ISSUE_PRIORITY.MEDIUM,
    status: ISSUE_STATUS.RESOLVED,
    labels: ['UI', 'mobile', 'frontend'],
    browser: 'Safari Mobile 17.2',
    operatingSystem: 'iOS 17',
    stepsToReproduce: 'Open Kanban on iPhone 15 Pro, grab card and drag down.',
    expectedResult: 'Card follows finger coordinate smoothly.',
    actualResult: 'Viewport scrolls instead of card drag triggering.',
  },
  {
    title: 'Race condition in concurrent issue assignment dispatch',
    description: 'Simultaneous assign requests override audit log actor credentials.',
    severity: ISSUE_SEVERITY.LOW,
    priority: ISSUE_PRIORITY.LOW,
    status: ISSUE_STATUS.CLOSED,
    labels: ['audit', 'backend'],
    browser: 'Any',
    operatingSystem: 'Linux',
    stepsToReproduce: 'Fire two concurrent PATCH requests with varying assignee IDs.',
    expectedResult: 'Optimistic lock prevents dirty writes.',
    actualResult: 'Database updates assignee without corresponding audit record.',
  },
];

module.exports = { seedUsers, seedProjects, issueTemplates };