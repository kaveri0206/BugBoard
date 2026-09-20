import React from 'react';
import { STATUS_COLORS } from '../../config/constants';
import Button from '../common/Button';

export default function StatusTransitionMenu({ currentStatus, onSelectStatus, disabled = false }) {
  const transitions = {
    Open: ['In Progress', 'Closed'],
    'In Progress': ['Testing', 'Open'],
    Testing: ['Resolved', 'Reopened'],
    Resolved: ['Closed', 'Reopened'],
    Closed: ['Reopened'],
    Reopened: ['In Progress', 'Closed'],
  };

  const nextOptions = transitions[currentStatus] || [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500 font-medium mr-1">Move to:</span>
      {nextOptions.length === 0 ? (
        <span className="text-xs text-slate-400 italic">No transitions available</span>
      ) : (
        nextOptions.map((status) => (
          <Button
            key={status}
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => onSelectStatus(status)}
            className={`border ${STATUS_COLORS[status] || ''}`}
          >
            {status}
          </Button>
        ))
      )}
    </div>
  );
}