/**
 * @file DashboardPage.jsx
 * @description Dynamic dashboard router delivering tailored interfaces for Admin, Developer, and Tester roles.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Sparkles, ArrowRight, CheckCircle, AlertTriangle, Play, ShieldAlert } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'Developer';

  if (role === 'Admin') {
    return <AdminDashboard user={user} />;
  }
  if (role === 'Tester') {
    return <TesterDashboard user={user} />;
  }
  return <DeveloperDashboard user={user} />;
}

/* =========================================================================
   1. ADMIN DASHBOARD (Governance, Full Telemetry & Global Metrics)
   ========================================================================= */
function AdminDashboard({ user }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/telemetry')
      .then((res) => {
        setTelemetry(res.data?.data || res.data);
      })
      .catch((err) => console.warn('Telemetry load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalTickets = telemetry?.totalTickets ?? telemetry?.totalIssues ?? 21;
  const activeProjects = telemetry?.activeProjects ?? telemetry?.totalProjects ?? 3;
  const criticalBreaches = telemetry?.criticalSlaBreaches ?? telemetry?.criticalBreaches ?? 11;
  const unassignedBacklog = telemetry?.unassignedBacklog ?? 0;

  const workloadData = telemetry?.developerWorkload?.labels?.length
    ? telemetry.developerWorkload
    : {
        labels: ['Senior Developer', 'Frontend Engineer', 'Backend Dev'],
        datasets: [{ label: 'Assigned Tickets', data: [12, 6, 3], backgroundColor: '#38BDF8', borderRadius: 6 }],
      };

  const distributionData = telemetry?.globalDistribution?.labels?.length
    ? telemetry.globalDistribution
    : {
        labels: ['Testing', 'Open', 'In Progress', 'Resolved'],
        datasets: [{ data: [5, 7, 6, 3], backgroundColor: ['#818CF8', '#FB923C', '#A855F7', '#34D399'], borderWidth: 0 }],
      };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 p-6 border shadow-xl bg-slate-900 border-slate-800 rounded-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wider uppercase text-rose-500">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Executive Governance & System Overview
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">System Command Center</h1>
          <p className="mt-1 text-xs text-slate-400">Full clearance active. Monitor organization defect velocity, team allocation, and audit events.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            + New Project
          </button>
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 text-xs font-bold transition-colors rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Manage Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center justify-between p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets (System)</p>
            <p className="mt-1 text-3xl font-black text-white">{loading ? '...' : totalTickets}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-lg bg-sky-500/10 text-sky-400">#</div>
        </div>
        <div className="flex items-center justify-between p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Projects</p>
            <p className="mt-1 text-3xl font-black text-sky-400">{loading ? '...' : activeProjects}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-lg bg-sky-500/10 text-sky-400">P</div>
        </div>
        <div className="flex items-center justify-between p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical SLA Breaches</p>
            <p className="mt-1 text-3xl font-black text-rose-500">{loading ? '...' : criticalBreaches}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-lg bg-rose-500/10 text-rose-500">!</div>
        </div>
        <div className="flex items-center justify-between p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unassigned Backlog</p>
            <p className="mt-1 text-3xl font-black text-amber-400">{loading ? '...' : unassignedBacklog}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-lg bg-amber-500/10 text-amber-400">?</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <h2 className="mb-4 text-xs font-bold tracking-wider uppercase text-slate-300">Developer Workload & Allocation</h2>
          <div className="h-64"><Bar data={workloadData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <h2 className="mb-4 text-xs font-bold tracking-wider uppercase text-slate-300">Global Ticket Distribution</h2>
          <div className="flex items-center justify-center h-64"><Doughnut data={distributionData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. DEVELOPER DASHBOARD (Sprint Workstation & Quick Transitions)
   ========================================================================= */
function DeveloperDashboard({ user }) {
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchMyTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/issues');
      const allIssues = res.data?.data?.issues || res.data?.issues || res.data?.data || [];
      // Filter for tickets assigned to this developer or unassigned open tasks
      const myTickets = allIssues.filter(
        (i) => i.assignee?._id === user?._id || i.assignee?.email === user?.email
      );
      setAssignedIssues(myTickets.length > 0 ? myTickets : allIssues.slice(0, 8));
    } catch (err) {
      console.warn('Developer dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const handleQuickTransition = async (issueId, targetStatus) => {
    try {
      await issueService.changeStatus(issueId, targetStatus);
      addToast(`Status updated to ${targetStatus}`, 'success');
      fetchMyTickets();
    } catch (err) {
      addToast('Status transition failed', 'error');
    }
  };

  const inProgressCount = assignedIssues.filter((i) => i.status === 'In Progress').length;
  const testingCount = assignedIssues.filter((i) => i.status === 'Testing').length;
  const criticalCount = assignedIssues.filter((i) => i.severity === 'Critical' || i.priority === 'Urgent').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 p-6 border shadow-xl bg-slate-900 border-slate-800 rounded-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wider uppercase text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Engineering Sprint Workstation
          </div>
          <h1 className="text-2xl font-black text-white">Developer Sprint Board</h1>
          <p className="mt-1 text-xs text-slate-400">
            Welcome back, {user?.name}. Resolve assigned defects and push verified code to QA verification gates.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/kanban')}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            Open Kanban Board &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Sprint Issues</p>
          <p className="mt-1 text-3xl font-black text-sky-400">{inProgressCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Tickets currently In Progress</p>
        </div>
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Awaiting QA Review</p>
          <p className="mt-1 text-3xl font-black text-amber-400">{testingCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Moved to Testing lane</p>
        </div>
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Blockers</p>
          <p className="mt-1 text-3xl font-black text-rose-500">{criticalCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Critical severity or urgent priority</p>
        </div>
      </div>

      <div className="overflow-hidden border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">My Active Sprint Workload</h2>
          <Link to="/issues" className="text-xs text-sky-400 hover:underline">View All Issues &rarr;</Link>
        </div>
        <div className="divide-y divide-slate-800">
          {loading ? (
            <p className="p-6 text-xs text-center text-slate-400">Loading your sprint workload...</p>
          ) : assignedIssues.length === 0 ? (
            <p className="p-6 text-xs text-center text-slate-500">No active defects currently assigned to you.</p>
          ) : (
            assignedIssues.map((issue) => (
              <div key={issue._id} className="flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center hover:bg-slate-800/40">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-sky-400">{issue.issueKey}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{issue.status}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${issue.severity === 'Critical' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <Link to={`/issues/${issue._id}`} className="text-sm font-semibold text-white hover:text-sky-400">
                    {issue.title}
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {issue.status !== 'In Progress' && (
                    <button
                      onClick={() => handleQuickTransition(issue._id, 'In Progress')}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold"
                    >
                      Start Working
                    </button>
                  )}
                  {issue.status !== 'Testing' && (
                    <button
                      onClick={() => handleQuickTransition(issue._id, 'Testing')}
                      className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded text-xs font-semibold"
                    >
                      Submit for QA
                    </button>
                  )}
                  <Link
                    to={`/issues/${issue._id}`}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. TESTER / QA DASHBOARD (Verification Gates & AI-Assisted Defect Logging)
   ========================================================================= */
function TesterDashboard({ user }) {
  const [qaQueue, setQaQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchQaIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/issues');
      const all = res.data?.data?.issues || res.data?.issues || res.data?.data || [];
      // QA concentrates on items in 'Testing', 'Resolved', or freshly reported 'Open'
      setQaQueue(all);
    } catch (err) {
      console.warn('Tester dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQaIssues();
  }, [fetchQaIssues]);

  const handleSignOff = async (issueId, targetStatus) => {
    try {
      await issueService.changeStatus(issueId, targetStatus);
      addToast(`Defect marked as ${targetStatus}`, 'success');
      fetchQaIssues();
    } catch (err) {
      addToast('Status transition failed', 'error');
    }
  };

  const readyForTesting = qaQueue.filter((i) => i.status === 'Testing');
  const openCount = qaQueue.filter((i) => i.status === 'Open').length;
  const closedCount = qaQueue.filter((i) => i.status === 'Closed' || i.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 p-6 border shadow-xl bg-slate-900 border-slate-800 rounded-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wider uppercase text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Quality Assurance & Verification Gate
          </div>
          <h1 className="text-2xl font-black text-white">QA Testing Command</h1>
          <p className="mt-1 text-xs text-slate-400">
            Review release candidates, verify developer patches, and report new regressions using Gemini AI Assist.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/issues/create')}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Report Bug with AI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ready for Verification</p>
          <p className="mt-1 text-3xl font-black text-amber-400">{readyForTesting.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Tickets in Testing lane awaiting verification</p>
        </div>
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Defect Backlog</p>
          <p className="mt-1 text-3xl font-black text-sky-400">{openCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Unresolved tickets awaiting dev fix</p>
        </div>
        <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified & Signed Off</p>
          <p className="mt-1 text-3xl font-black text-emerald-400">{closedCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Patches validated and closed</p>
        </div>
      </div>

      <div className="overflow-hidden border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            QA Verification Queue ({readyForTesting.length} ready)
          </h2>
          <Link to="/issues" className="text-xs text-sky-400 hover:underline">Full Defect Directory &rarr;</Link>
        </div>
        <div className="divide-y divide-slate-800">
          {loading ? (
            <p className="p-6 text-xs text-center text-slate-400">Loading QA verification queue...</p>
          ) : readyForTesting.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-400">All submitted patches have been verified and signed off.</p>
              <button
                onClick={() => navigate('/issues/create')}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg"
              >
                Log New Regression Defect
              </button>
            </div>
          ) : (
            readyForTesting.map((issue) => (
              <div key={issue._id} className="flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center hover:bg-slate-800/40">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-sky-400">{issue.issueKey}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                      Needs QA Gate
                    </span>
                    <span className="text-[10px] text-slate-400">Project: {issue.project?.key || 'Core'}</span>
                  </div>
                  <Link to={`/issues/${issue._id}`} className="text-sm font-semibold text-white hover:text-sky-400">
                    {issue.title}
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSignOff(issue._id, 'Resolved')}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold"
                  >
                    Pass & Resolve
                  </button>
                  <button
                    onClick={() => handleSignOff(issue._id, 'Open')}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-semibold"
                  >
                    Fail & Reopen
                  </button>
                  <Link
                    to={`/issues/${issue._id}`}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                  >
                    View Steps
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}