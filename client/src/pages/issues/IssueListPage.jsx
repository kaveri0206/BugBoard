/**
 * @file IssueListPage.jsx
 * @description Issue Directory with real-time responsive client/server filtering.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { issueService } from '../../services/issue.service';
import IssueFilterBar from '../../components/issues/IssueFilterBar';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS } from '../../config/constants';
import { Plus } from 'lucide-react';

export default function IssueListPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    severity: '',
    page: 1,
  });

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await issueService.getAll(filters);
      const rawIssues = res.data?.data?.issues || res.data?.issues || res.data?.data || [];
      const rawMeta = res.data?.meta || {
        page: filters.page,
        totalPages: 1,
        totalRecords: rawIssues.length,
      };

      setIssues(Array.isArray(rawIssues) ? rawIssues : []);
      setMeta(rawMeta);
    } catch (e) {
      console.warn('Failed to fetch issues:', e);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', priority: '', severity: '', page: 1 });
  };

  // Client-side fallback filter to ensure instantaneous response
  const displayedIssues = issues.filter((issue) => {
    if (filters.status && issue.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
    if (filters.priority && issue.priority?.toLowerCase() !== filters.priority.toLowerCase()) return false;
    if (filters.severity && issue.severity?.toLowerCase() !== filters.severity.toLowerCase()) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchKey = issue.issueKey?.toLowerCase().includes(q);
      const matchTitle = issue.title?.toLowerCase().includes(q);
      if (!matchKey && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 p-5 border shadow-lg sm:flex-row sm:items-center bg-slate-900 border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-white">Issue Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query, triage, and filter enterprise defects ({displayedIssues.length} matching)
          </p>
        </div>
        <Link
          to="/issues/create"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-sky-500/20 shrink-0"
        >
          <Plus size={14} /> Report Bug
        </Link>
      </div>

      {/* Filter Bar */}
      <IssueFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-sky-500" />
        </div>
      ) : displayedIssues.length === 0 ? (
        <div className="p-12 text-center border bg-slate-900 border-slate-800 rounded-xl">
          <EmptyState
            title="No defects found"
            message="No tickets matched your filter criteria. Try clearing search terms."
          />
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 mt-4 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden border shadow-xl bg-slate-900 border-slate-800 rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Key</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayedIssues.map((issue) => {
                  const statusClass = STATUS_COLORS?.[issue.status] || 'bg-slate-800 text-slate-300';
                  const priorityClass = PRIORITY_COLORS?.[issue.priority] || 'bg-slate-800 text-slate-300';
                  const severityClass = SEVERITY_COLORS?.[issue.severity] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr
                      key={issue._id}
                      onClick={() => navigate(`/issues/${issue._id}`)}
                      className="transition-colors cursor-pointer hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-sky-400">
                        {issue.issueKey}
                      </td>
                      <td className="max-w-sm px-4 py-3 font-medium text-white truncate">
                        {issue.title}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {issue.project?.projectKey || issue.project?.key || 'CORE'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusClass}>{issue.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${priorityClass}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${severityClass}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {issue.assignee?.name || <span className="text-amber-400/70">Unassigned</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-800">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalRecords={meta.totalRecords}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}