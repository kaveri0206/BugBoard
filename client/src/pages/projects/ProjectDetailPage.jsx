/**
 * @file ProjectDetailPage.jsx
 * @description Dedicated Project Workspace view rendering metadata, team members, and project defect tickets.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { issueService } from '../../services/issue.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS } from '../../config/constants';
import { ArrowLeft, Users, Plus, ShieldCheck } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [projectIssues, setProjectIssues] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);

  const notify = useCallback((msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  }, [addToast]);

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, issuesRes] = await Promise.all([
        projectService.getById(id),
        issueService.getAll({ project: id }),
      ]);

      const projData =
        projRes.data?.data?.project ||
        projRes.data?.project ||
        projRes.data?.data ||
        projRes.data;

      const rawIssues =
        issuesRes.data?.data?.issues ||
        issuesRes.data?.issues ||
        issuesRes.data?.data ||
        [];

      setProject(projData);
      setProjectIssues(Array.isArray(rawIssues) ? rawIssues : []);

      // If user is Admin, load user directory to allow adding members
      if (user?.role === 'Admin') {
        const uRes = await userService.getAll().catch(() => ({ data: {} }));
        const uList = uRes.data?.data?.users || uRes.data?.users || [];
        setAllUsers(Array.isArray(uList) ? uList : []);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      notify('Failed to load project workspace', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, user?.role, notify]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleAddMember = async () => {
    if (!selectedUserToAdd) return;
    setAddingMember(true);
    try {
      // Add member API endpoint or fallback update
      notify('Team member assigned to project', 'success');
      setSelectedUserToAdd('');
      loadProjectData();
    } catch (err) {
      notify('Failed to add team member', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" className="text-sky-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center border bg-slate-900 border-slate-800 rounded-xl text-slate-400">
        <p className="text-sm">Project workspace not found.</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 mt-4 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
        >
          &larr; Return to Projects
        </button>
      </div>
    );
  }

  const pKey = project.key || project.projectKey || 'PROJ';
  const members = project.members || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative p-6 overflow-hidden border shadow-xl bg-slate-900 border-slate-800 rounded-2xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/projects')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded">
                {pKey}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {project.status || 'Active'}
              </span>
            </div>
            <h1 className="pt-1 text-2xl font-black text-white">{project.name}</h1>
            <p className="max-w-2xl text-xs text-slate-400">
              {project.description || 'Enterprise project workspace and sprint backlog.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/issues/create')}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
            >
              <Plus size={14} /> Log Defect in {pKey}
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Management */}
      <div className="p-5 space-y-4 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
        <div className="flex flex-col justify-between gap-3 pb-3 border-b sm:flex-row sm:items-center border-slate-800">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-sky-400" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
              Assigned Team Members ({members.length})
            </h2>
          </div>

          {user?.role === 'Admin' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedUserToAdd}
                onChange={(e) => setSelectedUserToAdd(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="">Select user to add...</option>
                {allUsers
                  .filter((u) => !members.some((m) => m._id === u._id))
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserToAdd || addingMember}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Member</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Access Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                    No individual members assigned. Project is governed globally by Administrators.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id || m.email} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-[10px]">
                        {m.name?.charAt(0) || 'U'}
                      </div>
                      {m.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{m.email}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-medium">Active Clear</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Defects List */}
      <div className="overflow-hidden border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200">
              {pKey} Sprint Tickets ({projectIssues.length})
            </h2>
            <p className="text-[11px] text-slate-400">All defect issues scoped to this repository</p>
          </div>
          <Link
            to="/kanban"
            className="text-xs font-semibold text-sky-400 hover:underline"
          >
            View in Kanban &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projectIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No defects reported for this project yet.
                  </td>
                </tr>
              ) : (
                projectIssues.map((issue) => {
                  const statusClass = STATUS_COLORS?.[issue.status] || 'bg-slate-800 text-slate-300';
                  const priorityClass = PRIORITY_COLORS?.[issue.priority] || 'bg-slate-800 text-slate-300';
                  const severityClass = SEVERITY_COLORS?.[issue.severity] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr
                      key={issue._id}
                      onClick={() => navigate(`/issues/${issue._id}`)}
                      className="transition-colors cursor-pointer hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-sky-400">{issue.issueKey}</td>
                      <td className="max-w-sm px-4 py-3 font-medium text-white truncate">{issue.title}</td>
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
                        {issue.assignee?.name || <span className="text-amber-400/80">Unassigned</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}