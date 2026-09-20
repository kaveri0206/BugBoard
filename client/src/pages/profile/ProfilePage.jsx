/**
 * @file ProfilePage.jsx
 * @description User Profile & Security view with strictly isolated workload metrics
 * and an interactive Change Password management card.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { issueService } from '../../services/issue.service';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/common/Spinner';
import {
  Shield,
  Code,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Layers,
  Inbox,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const notify = useCallback(
    (msg, type = 'info') => {
      if (typeof addToast === 'function') addToast(msg, type);
    },
    [addToast]
  );

  const loadUserData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await issueService.getAll();
      const rawIssues =
        res.data?.data?.issues ||
        res.data?.issues ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      const currentUserId = String(user._id || user.id || '');

      // Strict Personal Isolation: ONLY include tickets explicitly assigned to this logged-in user
      const userAssigned = rawIssues.filter((issue) => {
        const assigneeId = String(
          issue.assignee?._id || issue.assignee?.id || issue.assignee || ''
        );
        return assigneeId !== '' && assigneeId === currentUserId;
      });

      setAssignedIssues(userAssigned);
    } catch (err) {
      console.error('Failed to load user profile workload:', err);
      setAssignedIssues([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle password update submission
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      notify('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      notify('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      notify('New password and confirm password do not match', 'error');
      return;
    }

    if (currentPassword === newPassword) {
      notify('New password must be different from current password', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Standard BugBoard auth password mutation endpoint
      await api.put(
        '/auth/updatepassword',
        {
          currentPassword,
          passwordCurrent: currentPassword,
          newPassword,
          password: newPassword,
        },
        { headers }
      );

      notify('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update password. Please verify your current password.';
      notify(msg, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (user?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isDeveloper = (user?.role || '').toLowerCase() === 'developer';

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="flex flex-col justify-between gap-6 p-6 border shadow-xl bg-slate-900 border-slate-800 rounded-2xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 text-xl font-extrabold border-2 rounded-full shadow-inner bg-slate-800 border-sky-500/30 text-sky-400">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-white">{user?.name || 'Developer'}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
                <Code size={12} />
                <span>{user?.role || 'Developer'}</span>
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">{user?.email}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              &gt;_ ID: {user?._id || user?.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/kanban"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border-slate-700"
          >
            <Layers size={14} className="text-sky-400" />
            <span>Sprint Board</span>
          </Link>
        </div>
      </div>

      {/* Developer Workload Card */}
      {isDeveloper && (
        <div className="p-6 space-y-4 border shadow-xl bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Code size={16} className="text-sky-400" />
              <h2 className="text-sm font-bold tracking-wide text-white">
                Developer Workspace & Active Code Pipeline
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Assigned Queue: <strong className="text-sky-400">{assignedIssues.length} issues</strong>
            </span>
          </div>

          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Assigned Active Tickets & Git Branch Generators
          </span>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="md" className="text-sky-500" />
            </div>
          ) : assignedIssues.length === 0 ? (
            /* True Empty State for Unassigned / Fresh Developers */
            <div className="px-4 py-12 space-y-2 text-center border border-dashed rounded-xl border-slate-800 bg-slate-950/40">
              <Inbox size={32} className="mx-auto mb-1 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                Your assigned ticket queue is clean
              </p>
              <p className="max-w-md mx-auto text-xs text-slate-500">
                No tickets have been assigned to you by an Administrator yet. When tickets are delegated to you, they will appear here along with your Git branch generation commands.
              </p>
            </div>
          ) : (
            /* Render strictly tickets assigned to this developer */
            <div className="space-y-3">
              {assignedIssues.map((issue) => {
                const branchName = `fix/${(issue.issueKey || 'defect').toLowerCase()}`;

                return (
                  <div
                    key={issue._id}
                    className="flex flex-col justify-between gap-3 p-4 transition-colors border bg-slate-950/60 border-slate-800/90 rounded-xl hover:border-slate-700 md:flex-row md:items-center"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                          {issue.issueKey || 'DEFECT'}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {issue.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {issue.status}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <GitBranch size={11} className="text-sky-400" />
                          git checkout -b {branchName}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/issues/${issue._id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 self-start md:self-auto"
                    >
                      <span>Open Ticket</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Security & Password Management Card */}
      <div className="p-6 space-y-4 border shadow-xl bg-slate-900 border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-sky-400" />
            <h2 className="text-sm font-bold tracking-wide text-white">
              Security & Credentials Management
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-1 text-xs transition-colors text-slate-400 hover:text-slate-200"
          >
            {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showPasswords ? 'Hide characters' : 'Show characters'}</span>
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="max-w-2xl space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs text-white transition-colors border bg-slate-950 border-slate-800 focus:border-sky-500 rounded-xl placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 text-xs text-white transition-colors border bg-slate-950 border-slate-800 focus:border-sky-500 rounded-xl placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-xs text-white transition-colors border bg-slate-950 border-slate-800 focus:border-sky-500 rounded-xl placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500">
              Passwords are salted and hashed using bcrypt prior to database storage.
            </p>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {passwordLoading ? (
                <Spinner size="xs" className="text-slate-950" />
              ) : (
                <KeyRound size={13} />
              )}
              <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Role & Security Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 p-4 border bg-slate-900 border-slate-800 rounded-xl">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">RBAC Session Enforced</p>
            <p className="text-[11px] text-slate-400">
              Role permissions strictly isolated to {user?.role || 'Developer'} policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 border bg-slate-900 border-slate-800 rounded-xl">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Shield size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Admin-Triage Protected</p>
            <p className="text-[11px] text-slate-400">
              Ticket assignment is managed directly by authorized system administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}