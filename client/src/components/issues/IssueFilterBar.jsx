import React from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { ISSUE_STATUS, ISSUE_PRIORITY, ISSUE_SEVERITY } from '../../config/constants';

export default function IssueFilterBar({ filters, onChange, onClear }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search issue key, title..."
          value={filters.search || ''}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </div>

      <div className="w-36">
        <Select
          value={filters.status || ''}
          onChange={(e) => onChange('status', e.target.value)}
          options={[
            { label: 'All Statuses', value: '' },
            ...Object.values(ISSUE_STATUS).map((s) => ({ label: s, value: s })),
          ]}
        />
      </div>

      <div className="w-36">
        <Select
          value={filters.priority || ''}
          onChange={(e) => onChange('priority', e.target.value)}
          options={[
            { label: 'All Priorities', value: '' },
            ...Object.values(ISSUE_PRIORITY).map((p) => ({ label: p, value: p })),
          ]}
        />
      </div>

      <div className="w-36">
        <Select
          value={filters.severity || ''}
          onChange={(e) => onChange('severity', e.target.value)}
          options={[
            { label: 'All Severities', value: '' },
            ...Object.values(ISSUE_SEVERITY).map((s) => ({ label: s, value: s })),
          ]}
        />
      </div>

      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
}