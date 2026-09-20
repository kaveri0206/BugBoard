import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS } from '../../config/constants';
import { Calendar, User } from 'lucide-react';

export default function IssueCard({ issue }) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Link
          to={`/issues/${issue._id}`}
          className="text-xs font-bold text-sky-600 hover:underline tracking-tight"
        >
          {issue.issueKey}
        </Link>
        <div className="flex items-center gap-1.5">
          <Badge className={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[issue.priority]}`}
          >
            {issue.priority}
          </span>
        </div>
      </div>

      <Link to={`/issues/${issue._id}`}>
        <h4 className="text-sm font-semibold text-slate-800 hover:text-sky-600 transition-colors line-clamp-1 mb-1">
          {issue.title}
        </h4>
      </Link>

      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
        {issue.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          {issue.assignee ? (
            <>
              <img
                src={issue.assignee.avatar}
                alt={issue.assignee.name}
                className="w-4 h-4 rounded-full border border-slate-200"
              />
              <span className="truncate max-w-[100px]">{issue.assignee.name}</span>
            </>
          ) : (
            <>
              <User size={12} className="text-slate-400" />
              <span className="italic text-slate-400">Unassigned</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${SEVERITY_COLORS[issue.severity]}`}
          >
            {issue.severity}
          </span>
          {issue.dueDate && (
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar size={11} />
              <span>{new Date(issue.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}