import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { 
  CheckCircle2, 
  RotateCcw, 
  PlusCircle, 
  FileSearch, 
  CheckSquare, 
  FileWarning 
} from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS } from '../../config/constants';
import { Link } from 'react-router-dom';

export default function TesterDashboard({ user }) {
  const { addToast } = useToast();
  const [testingQueue, setTestingQueue] = useState([]);
  const [myReportedIssues, setMyReportedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTesterData = async () => {
    try {
      const [testingRes, reportedRes] = await Promise.all([
        issueService.getAll({ status: 'Testing', limit: 20 }),
        issueService.getAll({ reporter: user._id, limit: 10 })
      ]);
      setTestingQueue(testingRes.data.data.issues || []);
      setMyReportedIssues(reportedRes.data.data.issues || []);
    } catch (err) {
      addToast('Failed to load QA testing queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTesterData();
  }, [user]);

  const handleResolve = async (issueId) => {
    setActionLoading(issueId);
    try {
      await issueService.changeStatus(issueId, 'Resolved');
      addToast('Defect validated and moved to Resolved', 'success');
      fetchTesterData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification update failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopen = async (issueId) => {
    setActionLoading(issueId);
    try {
      await issueService.changeStatus(issueId, 'Reopened');
      addToast('Defect regression logged: Ticket Reopened', 'info');
      fetchTesterData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Workflow transition failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 p-6 bg-white border shadow-sm rounded-xl border-slate-200 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="text-emerald-600" size={20} />
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-600">
              QA Quality Gate Workbench
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify code fixes in the Testing queue, validate reproduction steps, or log new defects using AI Assist.
          </p>
        </div>

        <Link to="/issues/create">
          <Button variant="primary" size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <PlusCircle size={14} /> Log New Bug (AI Powered)
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">Awaiting QA Verification</span>
          <span className="text-2xl font-bold text-purple-600">{testingQueue.length}</span>
        </div>
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">Bugs Reported By Me</span>
          <span className="text-2xl font-bold text-slate-800">{myReportedIssues.length}</span>
        </div>
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">Reopened Tickets</span>
          <span className="text-2xl font-bold text-rose-600">
            {myReportedIssues.filter(i => i.status === 'Reopened').length}
          </span>
        </div>
        <div className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
          <span className="block mb-1 text-xs font-semibold text-slate-500">Resolved Releases</span>
          <span className="text-2xl font-bold text-emerald-600">
            {myReportedIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-white border shadow-xs rounded-xl border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <FileSearch size={18} className="text-purple-600" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
              Ready for Verification Queue (Testing Status)
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400">Quality Gate Sign-off Station</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
          </div>
        ) : testingQueue.length === 0 ? (
          <EmptyState 
            title="Testing Queue Cleared" 
            message="No tickets currently waiting in Testing status. All deployed code has been verified." 
          />
        ) : (
          <div className="space-y-3">
            {testingQueue.map((issue) => (
              <div 
                key={issue._id}
                className="flex flex-col items-start justify-between gap-4 p-4 border border-purple-200 bg-purple-50/30 rounded-xl lg:flex-row lg:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/issues/${issue._id}`} className="text-xs font-bold text-purple-700 hover:underline">
                      {issue.issueKey}
                    </Link>
                    <h4 className="text-sm font-semibold text-slate-900">{issue.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[issue.priority]}`}>
                      {issue.priority}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[issue.severity]}`}>
                      {issue.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    Assignee Developer: <strong className="text-slate-800">{issue.assignee?.name || 'Unassigned'}</strong> &bull; Environment: {issue.environment}
                  </p>
                </div>

                <div className="flex items-center self-end gap-2 lg:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading === issue._id}
                    onClick={() => handleResolve(issue._id)}
                    className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={13} /> Pass & Resolve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={actionLoading === issue._id}
                    onClick={() => handleReopen(issue._id)}
                    className="gap-1 text-xs"
                  >
                    <RotateCcw size={13} /> Fail & Reopen
                  </Button>
                  <Link to={`/issues/${issue._id}`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      Inspect
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 space-y-4 bg-white border shadow-xs rounded-xl border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-slate-800">
            <FileWarning size={16} className="text-amber-600" />
            Recent Defects Logged By Me
          </h3>
          <Link to={`/issues?reporter=${user._id}`} className="text-xs font-medium text-sky-600 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="space-y-2">
          {myReportedIssues.slice(0, 5).map((issue) => (
            <div key={issue._id} className="flex items-center justify-between p-3 text-xs border rounded-lg bg-slate-50 border-slate-200">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sky-600">{issue.issueKey}</span>
                <span className="font-medium text-slate-800">{issue.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
                <span className="text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}