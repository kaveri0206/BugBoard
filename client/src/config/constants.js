// Roles
export const ROLES = {
  ADMIN: 'Admin',
  DEVELOPER: 'Developer',
  TESTER: 'Tester',
};

// Status Definitions (supports both STATUS and ISSUE_STATUS)
export const STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};
export const ISSUE_STATUS = STATUS;

// Priority Definitions (supports both PRIORITY and ISSUE_PRIORITY)
export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};
export const ISSUE_PRIORITY = PRIORITY;

// Severity Definitions (supports both SEVERITY and ISSUE_SEVERITY)
export const SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};
export const ISSUE_SEVERITY = SEVERITY;

// Badge Color Maps
export const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-amber-100 text-amber-800 border-amber-200',
  Testing: 'bg-purple-100 text-purple-800 border-purple-200',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-800 border-slate-200',
  Reopened: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-blue-100 text-blue-700 border-blue-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Urgent: 'bg-red-100 text-red-700 border-red-200',
};

export const SEVERITY_COLORS = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Critical: 'bg-rose-100 text-rose-800 border-rose-200',
};