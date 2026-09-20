import React from 'react';
import { Link } from 'react-router-dom';
import Table from '../common/Table';
import Badge from '../common/Badge';
import { STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS } from '../../config/constants';

export default function IssueTable({ issues = [], onSort, currentSort = {} }) {
  const renderSortArrow = (field) => {
    if (currentSort.sortBy !== field) return null;
    return currentSort.sortOrder === 'desc' ? ' ↓' : ' ↑';
  };

  const headers = [
    <span
      key="key"
      className="cursor-pointer hover:text-slate-900"
      onClick={() => onSort && onSort('issueKey')}
    >
      Key{renderSortArrow('issueKey')}
    </span>,
    <span
      key="title"
      className="cursor-pointer hover:text-slate-900"
      onClick={() => onSort && onSort('title')}
    >
      Title{renderSortArrow('title')}
    </span>,
    'Project',
    <span
      key="status"
      className="cursor-pointer hover:text-slate-900"
      onClick={() => onSort && onSort('status')}
    >
      Status{renderSortArrow('status')}
    </span>,
    'Priority',
    'Severity',
    'Assignee',
    <span
      key="created"
      className="cursor-pointer hover:text-slate-900"
      onClick={() => onSort && onSort('createdAt')}
    >
      Created{renderSortArrow('createdAt')}
    </span>,
  ];

  return (
    <Table headers={headers}>
      {issues.map((issue) => (
        <tr key={issue._id} className="hover:bg-slate-50 transition-colors">
          <td className="px-4 py-3 font-bold text-sky-600">
            <Link to={`/issues/${issue._id}`}>{issue.issueKey}</Link>
          </td>
          <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">
            <Link to={`/issues/${issue._id}`} className="hover:underline">
              {issue.title}
            </Link>
          </td>
          <td className="px-4 py-3 text-xs text-slate-600">
            {issue.project?.projectKey || 'N/A'}
          </td>
          <td className="px-4 py-3">
            <Badge className={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
          </td>
          <td className="px-4 py-3">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[issue.priority]}`}
            >
              {issue.priority}
            </span>
          </td>
          <td className="px-4 py-3">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[issue.severity]}`}
            >
              {issue.severity}
            </span>
          </td>
          <td className="px-4 py-3 text-xs text-slate-600">
            {issue.assignee ? (
              <div className="flex items-center gap-1.5">
                <img
                  src={issue.assignee.avatar}
                  alt={issue.assignee.name}
                  className="w-4 h-4 rounded-full border border-slate-200"
                />
                <span className="truncate">{issue.assignee.name}</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">Unassigned</span>
            )}
          </td>
          <td className="px-4 py-3 text-[11px] text-slate-400">
            {new Date(issue.createdAt).toLocaleDateString()}
          </td>
        </tr>
      ))}
    </Table>
  );
}