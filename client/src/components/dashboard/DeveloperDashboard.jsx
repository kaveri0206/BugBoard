import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { 
  Code2, 
  GitBranch, 
  Send, 
  Copy, 
  Terminal 
} from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../config/constants';
import { Link } from 'react-router-dom';

export default function DeveloperDashboard({ user }) {
  const { addToast } = useToast();
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [handoffLoading, setHandoffLoading] = useState(null);

  const fetchDevTasks = async () => {
    try {
      const res = await issueService.getAll({ assignee: user._id, limit: 50 });
      setAssignedIssues(res.data.data.issues || []);
    } catch (err) {
      addToast('Failed to load active sprint tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevTasks();
  }, [user]);

  const handleHandoffToQA = async (issueId) => {
    setHandoffLoading(issueId);
    try {
      await issueService.changeStatus(issueId, 'Testing');
      addToast('Ticket handed off to QA for verification', 'success');
      fetchDevTasks();
    } catch (err) {
      addToast(err.response?.data?.message || 'Workflow transition failed', 'error');
    } finally {
      setHandoffLoading(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast(`Copied ${label} to clipboard`, 'info');
  };

  const inProgressCount = assignedIssues.filter(i => i.status === 'In Progress').length;
  const inTestingCount = assignedIssues.filter(i => i.status === 'Testing').length;
  const criticalCount = assignedIssues.filter(i => i.severity === 'Critical' || i.severity === 'High').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 p-6 bg-white border shadow-sm rounded-xl border-slate-200 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="text-sky-600" size={20} />
            <span className="text-xs font-bold tracking-wider uppercase text-sky-600">
              Developer Sprint Console
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active implementation tasks, generate Git branches, and dispatch completed features to QA.
          </p>
        </div>

        <Link to="/kanban">
          <Button variant="primary" size="sm" className="gap-1.5">
            Open Drag-and-Drop Sprint Board
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">Total Assigned</span>
          <span className="text-2xl font-bold text-slate-800">{assignedIssues.length}</span>
        </div>
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">Active (In Progress)</span>
          <span className="text-2xl font-bold text-amber-600">{inProgressCount}</span>
        </div>
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">In QA Verification</span>
          <span className="text-2xl font-bold text-purple-600">{inTestingCount}</span>
        </div>
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">High/Critical Severity</span>
          <span className="text-2xl font-bold text-rose-600">{criticalCount}</span>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-white border shadow-xs rounded-xl border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-slate-800">
            <Terminal size={16} className="text-sky-600" />
            My Active Sprint Workstation
          </h3>
          <span className="text-xs text-slate-400">Showing {assignedIssues.length} assigned issues</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
        ) : assignedIssues.length === 0 ? (
          <EmptyState 
            title="Sprint Queue Clean" 
            message="You have no assigned tickets. Claim unassigned tickets from the Issue Directory." 
          />
        ) : (
          <div className="space-y-3">
            {assignedIssues.map((issue) => {
              const branchName = `fix/${issue.issueKey.toLowerCase()}-${issue.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .slice(0, 30)}`;
              const commitMsg = `fix(${issue.issueKey.toLowerCase()}): resolve ${issue.title.slice(0, 40)}`;

              return (
                <div 
                  key={issue._id}
                  className="flex flex-col items-start justify-between gap-4 p-4 transition-colors border bg-slate-50 border-slate-200 rounded-xl hover:border-slate-300 lg:flex-row lg:items-center"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/issues/${issue._id}`} 
                        className="text-xs font-bold text-sky-600 hover:underline"
                      >
                        {issue.issueKey}
                      </Link>
                      <h4 className="text-sm font-semibold text-slate-900">{issue.title}</h4>
                      <Badge className={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[issue.priority]}`}>
                        {issue.priority}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 font-mono">
                      <div className="flex items-center gap-1 bg-white px-2 py-0.5 border rounded">
                        <GitBranch size={12} className="text-slate-400" />
                        <span className="max-w-xs truncate">{branchName}</span>
                        <button 
                          onClick={() => copyToClipboard(`git checkout -b ${branchName}`, 'Git branch')}
                          className="ml-1 text-slate-400 hover:text-sky-600"
                          title="Copy git branch command"
                        >
                          <Copy size={11} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-white px-2 py-0.5 border rounded">
                        <Terminal size={12} className="text-slate-400" />
                        <span className="max-w-xs truncate">{commitMsg}</span>
                        <button 
                          onClick={() => copyToClipboard(`git commit -m "${commitMsg}"`, 'Commit message')}
                          className="ml-1 text-slate-400 hover:text-sky-600"
                          title="Copy commit message"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center self-end gap-2 lg:self-center">
                    {issue.status === 'In Progress' && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={handoffLoading === issue._id}
                        onClick={() => handleHandoffToQA(issue._id)}
                        className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Send size={12} /> Handoff to QA
                      </Button>
                    )}
                    <Link to={`/issues/${issue._id}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}