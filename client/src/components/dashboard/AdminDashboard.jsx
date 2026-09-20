import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import { projectService } from '../../services/project.service';
import { activityService } from '../../services/activity.service';
import { useToast } from '../../hooks/useToast';
import StatusPieChart from '../charts/StatusPieChart';
import WorkloadBarChart from '../charts/WorkloadBarChart';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Skeleton from '../common/Skeleton';
import { 
  ShieldCheck, 
  FolderPlus, 
  Users, 
  AlertOctagon, 
  Activity, 
  FileWarning, 
  FolderGit2, 
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard({ user }) {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', projectKey: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [statsRes, metricsRes, auditRes, projectRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getMetrics(),
        activityService.getAuditLogs({ limit: 6 }),
        projectService.getAll()
      ]);
      setStats(statsRes.data.data);
      setMetrics(metricsRes.data.data);
      setAuditLogs(auditRes.data.data.logs || []);
      setProjects(projectRes.data.data.projects || []);
    } catch (err) {
      addToast('Failed to load administrative telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectService.create(projectForm);
      addToast('Project initialized successfully', 'success');
      setCreateProjectOpen(false);
      setProjectForm({ name: '', projectKey: '', description: '' });
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const adminCards = [
    { label: 'Total Tickets (System)', val: stats?.totalIssues, icon: FileWarning, color: 'text-slate-800' },
    { label: 'Active Projects', val: projects?.length, icon: FolderGit2, color: 'text-sky-600' },
    { label: 'Critical SLA Breaches', val: stats?.criticalIssues, icon: AlertOctagon, color: 'text-rose-600' },
    { label: 'Unassigned Backlog', val: (stats?.totalIssues || 0) - (stats?.myAssignedIssues || 0), icon: Users, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 p-6 text-white border shadow-sm bg-slate-900 rounded-xl md:flex-row md:items-center border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-rose-500" size={20} />
            <span className="text-xs font-bold tracking-wider uppercase text-rose-400">
              Executive Governance & System Overview
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold">System Command Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full clearance active. Monitor organization defect velocity, team allocation, and audit events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setCreateProjectOpen(true)}
            className="gap-1.5 bg-sky-600 hover:bg-sky-500"
          >
            <FolderPlus size={14} /> New Project
          </Button>
          <Link to="/admin/users">
            <Button variant="secondary" size="sm" className="gap-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700">
              <Users size={14} /> Manage Team
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {adminCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="p-4 bg-white border shadow-xs rounded-xl border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                <Icon size={18} className={c.color} />
              </div>
              {loading ? (
                <Skeleton className="w-16 h-7" />
              ) : (
                <span className={`text-2xl font-bold ${c.color}`}>{c.val || 0}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white border shadow-xs rounded-xl border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-700">
              Developer Workload & Allocation
            </h3>
            <Link to="/analytics" className="flex items-center gap-1 text-xs text-sky-600 hover:underline">
              Full Analytics <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="h-64">
            {metrics?.developerWorkload ? (
              <WorkloadBarChart data={metrics.developerWorkload} />
            ) : (
              <Skeleton className="w-full h-full" />
            )}
          </div>
        </div>

        <div className="p-6 bg-white border shadow-xs rounded-xl border-slate-200">
          <h3 className="mb-4 text-xs font-bold tracking-wider uppercase text-slate-700">
            Global Ticket Distribution
          </h3>
          <div className="h-64">
            {metrics?.statusDistribution ? (
              <StatusPieChart data={metrics.statusDistribution} />
            ) : (
              <Skeleton className="w-full h-full" />
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-white border shadow-xs rounded-xl border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-sky-600" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
              Recent System Audit Activity
            </h3>
          </div>
          <Link to="/admin/audit" className="text-xs font-semibold text-sky-600 hover:underline">
            View Complete Audit Trail &rarr;
          </Link>
        </div>

        <Table headers={['Timestamp', 'Actor', 'Action', 'Entity', 'Summary']}>
          {auditLogs.map((log) => (
            <tr key={log._id} className="text-xs hover:bg-slate-50">
              <td className="px-4 py-2.5 text-slate-400 font-mono">
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-4 py-2.5 font-semibold text-slate-800">{log.actor?.name}</td>
              <td className="px-4 py-2.5 font-mono text-sky-600">{log.action}</td>
              <td className="px-4 py-2.5 text-slate-600">{log.entityType}</td>
              <td className="px-4 py-2.5 text-slate-700 truncate max-w-sm">{log.message}</td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal isOpen={createProjectOpen} onClose={() => setCreateProjectOpen(false)} title="Initialize New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            required
            placeholder="e.g., Cloud Billing Microservice"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
          />
          <Input
            label="Project Key (2 to 6 uppercase letters)"
            required
            placeholder="BILL"
            value={projectForm.projectKey}
            onChange={(e) => setProjectForm({ ...projectForm, projectKey: e.target.value.toUpperCase() })}
          />
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              className="w-full p-3 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Scope and purpose of this project workspace..."
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setCreateProjectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Provision Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}