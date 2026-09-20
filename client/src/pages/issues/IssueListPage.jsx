import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/issue.service';
import IssueFilterBar from '../../components/issues/IssueFilterBar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS } from '../../config/constants';
import { Link } from 'react-router-dom';

export default function IssueListPage() {
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

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await issueService.getAll(filters);
      setIssues(res.data.data.issues);
      setMeta(res.data.meta);
    } catch (e) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Issue Directory</h1>
          <p className="text-xs text-slate-500">Query, triage, and filter enterprise defects.</p>
        </div>
        <Link to="/issues/create">
          <Button variant="primary">+ Report Bug</Button>
        </Link>
      </div>

      <IssueFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={() => setFilters({ search: '', status: '', priority: '', severity: '', page: 1 })}
      />

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" className="text-sky-600" />
        </div>
      ) : issues.length === 0 ? (
        <EmptyState title="No issues found" message="No defects matched your filter parameters." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <Table headers={['Key', 'Title', 'Project', 'Status', 'Priority', 'Severity', 'Assignee']}>
            {issues.map((issue) => (
              <tr key={issue._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-sky-600">
                  <Link to={`/issues/${issue._id}`}>{issue.issueKey}</Link>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">
                  <Link to={`/issues/${issue._id}`} className="hover:underline">
                    {issue.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{issue.project?.projectKey}</td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[issue.priority]}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[issue.severity]}`}>
                    {issue.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {issue.assignee ? issue.assignee.name : 'Unassigned'}
                </td>
              </tr>
            ))}
          </Table>
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalRecords={meta.totalRecords}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          />
        </div>
      )}
    </div>
  );
}