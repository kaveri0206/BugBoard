/**
 * @file seedData.js
 * @description Master enterprise mock dataset for BugBoard.
 * Includes RBAC users, project workspaces, defect templates with file/screenshot
 * attachments, and initial sprint distributions.
 */

const { ROLES, ISSUE_STATUS, ISSUE_SEVERITY, ISSUE_PRIORITY } = require('../config/constants');

/* =========================================================================
   1. USERS DIRECTORY (Admin, Developer, Tester Tiers)
   ========================================================================= */
const seedUsers = [
  {
    name: 'Eleanor Vance (Admin)',
    email: 'admin@bugboard.dev',
    role: ROLES.ADMIN,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Eleanor%20Vance',
    isActive: true,
  },
  {
    name: 'Marcus Brody (Lead Dev)',
    email: 'developer@bugboard.dev',
    role: ROLES.DEVELOPER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Marcus%20Brody',
    isActive: true,
  },
  {
    name: 'Elena Rostova (Backend Dev)',
    email: 'elena@bugboard.dev',
    role: ROLES.DEVELOPER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Elena%20Rostova',
    isActive: true,
  },
  {
    name: 'Kenji Sato (Frontend Dev)',
    email: 'kenji@bugboard.dev',
    role: ROLES.DEVELOPER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Kenji%20Sato',
    isActive: true,
  },
  {
    name: 'Sarah Connor (Senior QA)',
    email: 'tester@bugboard.dev',
    role: ROLES.TESTER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Sarah%20Connor',
    isActive: true,
  },
  {
    name: 'David Mills (QA Engineer)',
    email: 'david@bugboard.dev',
    role: ROLES.TESTER,
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=David%20Mills',
    isActive: true,
  },
];

/* =========================================================================
   2. PROJECT WORKSPACES (With Dual 'key' and 'projectKey' Compatibility)
   ========================================================================= */
const seedProjects = [
  {
    name: 'CloudScale Payment Gateway',
    key: 'PAY',
    projectKey: 'PAY',
    description: 'Core billing orchestration microservice handling PCI-compliant checkout flows and webhook relays.',
    status: 'Active',
  },
  {
    name: 'AeroMobile Logistics iOS/Android',
    key: 'AERO',
    projectKey: 'AERO',
    description: 'Fleet driver companion app for real-time delivery telemetry, barcode scanning, and proof of dropoff.',
    status: 'Active',
  },
  {
    name: 'Quantum Analytics Portal',
    key: 'QAN',
    projectKey: 'QAN',
    description: 'High-throughput time-series customer intelligence dashboard with OLAP data warehouse connectors.',
    status: 'Active',
  },
];

/* =========================================================================
   3. DEFECT TEMPLATES (Populated with Screenshots, Logs & Stack Traces)
   ========================================================================= */
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
    environment: 'Staging-US-East',
    stepsToReproduce: '1. Intercept checkout POST payload.\n2. Replay authorization with same timestamp header.\n3. Observe duplicate capture event in ledger.',
    expectedResult: 'System returns HTTP 409 Idempotency Conflict and drops duplicate charge token.',
    actualResult: 'Second transaction processed with unique checkout invoice ID.',
    attachments: [
      {
        filename: 'stripe_duplicate_webhook_trace.png',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        size: '348 KB',
        type: 'image/png',
        uploadedAt: new Date('2026-09-18T10:30:00Z'),
      },
      {
        filename: 'idempotency_cache_miss_dump.json',
        url: '#',
        size: '22 KB',
        type: 'application/json',
        uploadedAt: new Date('2026-09-18T10:31:00Z'),
      },
    ],
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
    environment: 'Production-Web',
    stepsToReproduce: '1. Artificially clear refresh cookie.\n2. Trigger authenticated API request.\n3. Monitor Network Tab.',
    expectedResult: 'Client redirects cleanly to /login with session expired toast.',
    actualResult: 'Continuous recurring refresh requests fired until tab crashes.',
    attachments: [
      {
        filename: 'browser_network_infinite_loop.png',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        size: '412 KB',
        type: 'image/png',
        uploadedAt: new Date('2026-09-19T08:15:00Z'),
      },
      {
        filename: 'axios_interceptor_error.log',
        url: '#',
        size: '14 KB',
        type: 'text/plain',
        uploadedAt: new Date('2026-09-19T08:16:00Z'),
      },
    ],
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
    environment: 'Worker-Cluster-02',
    stepsToReproduce: 'Execute npm run test:load with concurrency > 250.',
    expectedResult: 'Connection pool throttles workers gracefully without socket resets.',
    actualResult: 'Server outputs ETIMEDOUT and hangs all active queries.',
    attachments: [
      {
        filename: 'pg_pool_exhaustion_graph.png',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        size: '520 KB',
        type: 'image/png',
        uploadedAt: new Date('2026-09-19T14:40:00Z'),
      },
      {
        filename: 'pg_pool_deadlock_report.txt',
        url: '#',
        size: '48 KB',
        type: 'text/plain',
        uploadedAt: new Date('2026-09-19T14:41:00Z'),
      },
    ],
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
    environment: 'Mobile-Safari',
    stepsToReproduce: 'Open Kanban on iPhone 15 Pro, grab card and drag down.',
    expectedResult: 'Card follows finger coordinate smoothly.',
    actualResult: 'Viewport scrolls instead of card drag triggering.',
    attachments: [
      {
        filename: 'webkit_touch_event_mismatch.png',
        url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
        size: '290 KB',
        type: 'image/png',
        uploadedAt: new Date('2026-09-20T09:10:00Z'),
      },
    ],
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
    environment: 'API-Gateway',
    stepsToReproduce: 'Fire two concurrent PATCH requests with varying assignee IDs.',
    expectedResult: 'Optimistic lock prevents dirty writes.',
    actualResult: 'Database updates assignee without corresponding audit record.',
    attachments: [
      {
        filename: 'concurrent_mutation_race_condition.log',
        url: '#',
        size: '31 KB',
        type: 'text/plain',
        uploadedAt: new Date('2026-09-20T11:20:00Z'),
      },
      {
        filename: 'audit_log_missing_entry.png',
        url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
        size: '185 KB',
        type: 'image/png',
        uploadedAt: new Date('2026-09-20T11:22:00Z'),
      },
    ],
  },
  {
    title: 'OLAP query timeout on date range partitions exceeding 180 days',
    description: 'ClickHouse aggregate queries without secondary partition pruning hit the 30-second gateway threshold.',
    severity: ISSUE_SEVERITY.HIGH,
    priority: ISSUE_PRIORITY.HIGH,
    status: ISSUE_STATUS.OPEN,
    labels: ['analytics', 'database', 'performance'],
    browser: 'Chrome 125',
    operatingSystem: 'Windows 11 Pro',
    environment: 'Analytics-Engine',
    stepsToReproduce: 'Select custom date range spanning 2025-01-01 to 2025-09-30 in analytics portal.',
    expectedResult: 'Query results streamed in sub-2000ms using partitioned rollups.',
    actualResult: 'Gateway terminates stream with 504 Gateway Timeout.',
    attachments: [
      {
        filename: 'olap_query_explain_analyze.json',
        url: '#',
        size: '64 KB',
        type: 'application/json',
        uploadedAt: new Date('2026-09-20T15:00:00Z'),
      },
      {
        filename: 'query_execution_spike.png',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        size: '410 KB',
        type: 'image/png',
        uploadedAt: new Date('2026-09-20T15:05:00Z'),
      },
    ],
  },
  {
    title: 'Barcode scanner camera preview freezes on Android 14 camera HAL renegotiation',
    description: 'Switching between front and rear cameras in AeroMobile companion app leaves CameraX surface detached.',
    severity: ISSUE_SEVERITY.MEDIUM,
    priority: ISSUE_PRIORITY.HIGH,
    status: ISSUE_STATUS.TESTING,
    labels: ['mobile', 'android', 'hardware'],
    browser: 'Native App',
    operatingSystem: 'Android 14 (OneUI 6.1)',
    environment: 'Mobile-Device-Fleet',
    stepsToReproduce: '1. Launch delivery scan.\n2. Tap camera switch icon twice.\n3. Observe black viewfinder preview.',
    expectedResult: 'Viewfinder re-binds CameraSelector without frozen surfaces.',
    actualResult: 'Camera preview black screen requires application force-restart.',
    attachments: [
      {
        filename: 'camerax_surface_unbind_crash.png',
        url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
        size: '320 KB',
        type: 'image/png',
        uploadedAt: new Date('2026-09-20T16:30:00Z'),
      },
      {
        filename: 'logcat_camerax_hal_error.log',
        url: '#',
        size: '42 KB',
        type: 'text/plain',
        uploadedAt: new Date('2026-09-20T16:32:00Z'),
      },
    ],
  },
];

module.exports = {
  seedUsers,
  seedProjects,
  issueTemplates,
};