import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/auth.service';
import { issueService } from '../../services/issue.service';
import { projectService } from '../../services/project.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { 
  ShieldCheck, 
  Code2, 
  CheckCircle2, 
  Terminal, 
  AlertTriangle, 
  Layers, 
  GitBranch, 
  CheckSquare, 
  Key,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [myIssues, setMyIssues] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const [issueRes, projectRes] = await Promise.all([
          issueService.getAll({ assignee: user?._id, limit: 5 }),
          projectService.getAll()
        ]);
        setMyIssues(issueRes.data.data.issues || []);
        setMyProjects(projectRes.data.data.projects || []);
      } catch (err) {
        // Silently catch background data loading
      }
    };
    if (user) fetchPersonalData();
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.changePassword(passData);
      addToast('Password updated securely', 'success');
      setPassData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleProfileBadge = () => {
    if (user?.role === 'Admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldCheck size={14} /> System Administrator
        </span>
      );
    }
    if (user?.role === 'Developer') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Code2 size={14} /> Full-Stack Software Engineer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={14} /> Quality Assurance & SDET
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col items-start justify-between gap-6 p-6 bg-white border shadow-sm rounded-xl border-slate-200 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <img 
            src={user?.avatar} 
            alt={user?.name} 
            className="w-20 h-20 p-1 border-2 rounded-full border-slate-200 bg-slate-50" 
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              {renderRoleProfileBadge()}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 font-mono">
              <Terminal size={12} /> ID: {user?._id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {user?.role === 'Admin' && (
            <Link to="/admin/users">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Users size={14} /> User Governance
              </Button>
            </Link>
          )}
          {user?.role === 'Developer' && (
            <Link to="/kanban">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Layers size={14} /> Sprint Board
              </Button>
            </Link>
          )}
          {user?.role === 'Tester' && (
            <Link to="/issues/create">
              <Button variant="primary" size="sm" className="gap-1.5">
                <AlertTriangle size={14} /> Log Defect Ticket
              </Button>
            </Link>
          )}
        </div>
      </div>

      {user?.role === 'Admin' && (
        <div className="p-6 space-y-4 text-white border shadow-sm bg-slate-900 rounded-xl border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="flex items-center gap-2 text-sm font-bold text-rose-400">
              <ShieldCheck size={18} /> Executive Security & System Governance Scope
            </h3>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
              Full Clearance Mode
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
            <div className="p-4 border rounded-lg bg-slate-800/80 border-slate-700">
              <span className="text-slate-400 block text-[11px] mb-1">User Governance</span>
              <p className="mb-3 font-medium text-slate-200">
                Full authority to assign Developer/Tester roles, activate or lock user accounts.
              </p>
              <Link to="/admin/users" className="text-sky-400 hover:underline">
                Open Directory &rarr;
              </Link>
            </div>
            <div className="p-4 border rounded-lg bg-slate-800/80 border-slate-700">
              <span className="text-slate-400 block text-[11px] mb-1">System Audit Ledger</span>
              <p className="mb-3 font-medium text-slate-200">
                Inspect immutable activity trails across all projects, status changes, and assignments.
              </p>
              <Link to="/admin/audit" className="text-sky-400 hover:underline">
                View Audit Trail &rarr;
              </Link>
            </div>
            <div className="p-4 border rounded-lg bg-slate-800/80 border-slate-700">
              <span className="text-slate-400 block text-[11px] mb-1">Project Portfolio</span>
              <p className="mb-3 font-medium text-slate-200">
                {myProjects.length} active enterprise projects under your administrative overview.
              </p>
              <Link to="/projects" className="text-sky-400 hover:underline">
                Manage Projects &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'Developer' && (
        <div className="p-6 space-y-4 bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="flex items-center gap-2 text-sm font-bold text-sky-700">
              <Code2 size={18} /> Developer Workspace & Active Code Pipeline
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Assigned Queue: {myIssues.length} issues
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-600">
              Assigned Active Tickets & Git Branch Generators
            </h4>
            {myIssues.length === 0 ? (
              <p className="py-2 text-xs italic text-slate-400">
                No active issues assigned. Claim issues from the directory or project boards.
              </p>
            ) : (
              <div className="space-y-2">
                {myIssues.map((issue) => (
                  <div 
                    key={issue._id} 
                    className="flex flex-col items-start justify-between gap-3 p-3 text-xs border rounded-lg bg-slate-50 border-slate-200 md:flex-row md:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-600">{issue.issueKey}</span>
                        <span className="font-medium text-slate-800">{issue.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-[10px] bg-slate-200 text-slate-700">{issue.status}</Badge>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <GitBranch size={12} /> git checkout -b fix/{issue.issueKey.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <Link to={`/issues/${issue._id}`}>
                      <Button variant="secondary" size="sm">Open Ticket</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {user?.role === 'Tester' && (
        <div className="p-6 space-y-4 bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={18} /> QA Testing Workbench & Quality Gate
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Verification Authority: Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-emerald-50/50 border-emerald-200">
              <span className="block mb-1 font-bold text-emerald-900">Testing & QA Status Authority</span>
              <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                Testers own final quality gating: Only QA and Admins can transition tickets from 
                <strong> Testing &rarr; Resolved</strong> or trigger <strong>Reopened</strong> on defect regression.
              </p>
              <Link to="/issues?status=Testing">
                <Button variant="secondary" size="sm" className="bg-white border-emerald-300 text-emerald-800">
                  <CheckSquare size={13} className="mr-1" /> View Testing Queue
                </Button>
              </Link>
            </div>

            <div className="p-4 border rounded-lg bg-sky-50/50 border-sky-200">
              <span className="block mb-1 font-bold text-sky-900">AI Test-Case Assistance</span>
              <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                Use Google Gemini to automatically generate negative and boundary test conditions when creating or auditing bug reports.
              </p>
              <Link to="/issues/create">
                <Button variant="secondary" size="sm" className="bg-white border-sky-300 text-sky-800">
                  <AlertTriangle size={13} className="mr-1" /> Report New Bug With AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-white border shadow-sm rounded-xl border-slate-200">
        <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-800">
          <Key size={16} className="text-slate-500" /> Security Credentials
        </h3>
        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Current Password"
            type="password"
            required
            value={passData.currentPassword}
            onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            required
            value={passData.newPassword}
            onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
          />
          <div className="flex justify-end md:col-span-2">
            <Button type="submit" variant="primary" loading={loading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}