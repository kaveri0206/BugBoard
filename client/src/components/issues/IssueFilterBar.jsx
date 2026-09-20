/**
 * @file IssueFilterBar.jsx
 * @description Active filter bar for Issue Registry with high contrast inputs and instant reactive search.
 */

import React from 'react';
import { ISSUE_STATUS, ISSUE_PRIORITY, ISSUE_SEVERITY } from '../../config/constants';
import { Search, X } from 'lucide-react';

export default function IssueFilterBar({ filters, onChange, onClear }) {
  const statuses = Object.values(ISSUE_STATUS || {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    TESTING: 'Testing',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  });

  const priorities = Object.values(ISSUE_PRIORITY || {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  });

  const severities = Object.values(ISSUE_SEVERITY || {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  });

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.priority || filters.severity
  );

  return (
    <div className="p-4 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="Search issue key, title, or description..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={filters.status || ''}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs text-white transition-all border rounded-lg cursor-pointer bg-slate-950 border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="" className="bg-slate-900 text-slate-400">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status} className="text-white bg-slate-900">
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Dropdown */}
        <div>
          <select
            value={filters.priority || ''}
            onChange={(e) => onChange('priority', e.target.value)}
            className="w-full px-3 py-2 text-xs text-white transition-all border rounded-lg cursor-pointer bg-slate-950 border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="" className="bg-slate-900 text-slate-400">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority} className="text-white bg-slate-900">
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Dropdown + Clear Button */}
        <div className="flex gap-2">
          <select
            value={filters.severity || ''}
            onChange={(e) => onChange('severity', e.target.value)}
            className="w-full px-3 py-2 text-xs text-white transition-all border rounded-lg cursor-pointer bg-slate-950 border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="" className="bg-slate-900 text-slate-400">All Severities</option>
            {severities.map((severity) => (
              <option key={severity} value={severity} className="text-white bg-slate-900">
                {severity}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold transition-all border rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 shrink-0"
              title="Reset all filters"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}