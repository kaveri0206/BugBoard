import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { PRIORITY_COLORS, SEVERITY_COLORS } from '../../config/constants';
import { Link } from 'react-router-dom';

export default function KanbanCard({ issue, index }) {
  if (!issue) return null;

  return (
    <Draggable draggableId={String(issue._id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 bg-white rounded-lg border shadow-sm mb-2.5 transition-shadow select-none ${
            snapshot.isDragging
              ? 'shadow-lg border-sky-400 ring-2 ring-sky-200'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <Link
              to={`/issues/${issue._id}`}
              className="text-xs font-bold text-sky-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {issue.issueKey}
            </Link>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                PRIORITY_COLORS[issue.priority] || 'text-slate-600 bg-slate-100'
              }`}
            >
              {issue.priority}
            </span>
          </div>

          <p className="mb-2 text-xs font-medium text-slate-800 line-clamp-2">
            {issue.title}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                SEVERITY_COLORS[issue.severity] || 'text-slate-600 bg-slate-100'
              }`}
            >
              {issue.severity}
            </span>
            {issue.assignee ? (
              <img
                src={issue.assignee.avatar}
                alt={issue.assignee.name}
                title={issue.assignee.name}
                className="w-5 h-5 border rounded-full border-slate-200"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                    issue.assignee?.name || 'U'
                  )}`;
                }}
              />
            ) : (
              <span className="text-[10px] text-slate-400 italic">Unassigned</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}