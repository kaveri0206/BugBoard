export const ROLES = {
  ADMIN: 'Admin',
  DEVELOPER: 'Developer',
  TESTER: 'Tester',
};

export const ISSUE_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const ISSUE_SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const ISSUE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const PROJECT_STATUS = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
};

export const STATUS_COLORS = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Testing: 'bg-purple-50 text-purple-700 border-purple-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
  Reopened: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const PRIORITY_COLORS = {
  Low: 'text-slate-600 bg-slate-100',
  Medium: 'text-blue-700 bg-blue-100',
  High: 'text-amber-700 bg-amber-100',
  Urgent: 'text-rose-700 bg-rose-100',
};

export const SEVERITY_COLORS = {
  Low: 'text-slate-600 bg-slate-100',
  Medium: 'text-blue-700 bg-blue-100',
  High: 'text-orange-700 bg-orange-100',
  Critical: 'text-red-800 bg-red-100 font-semibold',
};