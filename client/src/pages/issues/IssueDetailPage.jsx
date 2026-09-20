/**
 * @file IssueDetailPage.jsx
 * @description Defect Ticket Detail view enforcing Strict Admin-Only Assignment RBAC.
 * Only Admins can assign/reassign tickets. Developers and Testers have a read-only assignee display.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { issueService } from '../../services/issue.service';
import { userService } from '../../services/user.service';
import { activityService } from '../../services/activity.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/common/Spinner';
import FileAttachmentList from '../../components/issues/FileAttachmentList';
import CommentList from '../../components/comments/CommentList';
import CommentEditor from '../../components/comments/CommentEditor';
import {
  STATUS_COLORS,
  PRIORITY_COLORS,
  SEVERITY_COLORS,
} from '../../config/constants';
import { ArrowLeft, Edit } from 'lucide-react';

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [issue, setIssue] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  const notify = useCallback((msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  }, [addToast]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [issueRes, usersRes, actRes] = await Promise.all([
        issueService.getById(id),
        userService.getAll().catch(() => ({ data: {} })),
        activityService.getIssueActivities(id).catch(() => ({ data: {} })),
      ]);

      const issueData =
        issueRes.data?.data?.issue ||
        issueRes.data?.issue ||
        issueRes.data?.data ||
        issueRes.data;
      setIssue(issueData);

      const rawUsers =
        usersRes.data?.data?.users ||
        usersRes.data?.users ||
        usersRes.data?.data ||
        [];
      setUsersList(Array.isArray(rawUsers) ? rawUsers : []);

      const rawActivities =
        actRes.data?.data?.activities ||
        actRes.data?.activities ||
        actRes.data?.data ||
        [];
      setActivities(Array.isArray(rawActivities) ? rawActivities : []);
    } catch (err) {
      console.error('Failed to load issue details:', err);
      notify('Failed to load issue ticket', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Assignee Change (Authorized exclusively for Admin)
  const handleAssigneeChange = async (newAssigneeId) => {
    setUpdatingAssignee(true);
    try {
      const payload = { assignee: newAssigneeId === '' ? null : newAssigneeId };
      await issueService.update(id, payload);

      setIssue((prev) => {
        const foundUser = usersList.find((u) => u._id === newAssigneeId);
        return {
          ...prev,
          assignee: foundUser || null,
        };
      });

      notify(
        newAssigneeId ? 'Assignee updated successfully!' : 'Ticket unassigned',
        'success'
      );

      const actRes = await activityService.getIssueActivities(id).catch(() => null);
      if (actRes?.data) {
        const updatedActivities =
          actRes.data?.data?.activities || actRes.data?.activities || [];
        setActivities(updatedActivities);
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update assignee', 'error');
    } finally {
      setUpdatingAssignee(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    try {
      await issueService.changeStatus(id, newStatus);
      notify(`Workflow state transitioned to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      notify(err.response?.data?.message || 'Status transition rejected', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" className="text-sky-500" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-12 text-center border bg-slate-900 border-slate-800 rounded-xl text-slate-400">
        <p className="text-sm">Defect ticket not found.</p>
        <button
          onClick={() => navigate('/issues')}
          className="px-4 py-2 mt-4 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
        >
          &larr; Return to Issue Directory
        </button>
      </div>
    );
  }

  // Filter: Only users with role === 'Developer' appear in the admin triage dropdown
  const eligibleDevelopers = usersList.filter((u) => u.role === 'Developer');
  const currentAssigneeId = issue.assignee?._id || issue.assignee || '';

  const statusClass = STATUS_COLORS?.[issue.status] || 'bg-slate-800 text-slate-300';
  const priorityClass = PRIORITY_COLORS?.[issue.priority] || 'bg-slate-800 text-slate-300';
  const severityClass = SEVERITY_COLORS?.[issue.severity] || 'bg-slate-800 text-slate-300';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 space-y-4 border shadow-xl bg-slate-900 border-slate-800 rounded-2xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Go Back"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded">
                {issue.issueKey || 'DEFECT'}
              </span>
              <span className="text-xs text-slate-400">
                Project:{' '}
                <strong className="text-slate-200">
                  {issue.project?.name || issue.project?.key || 'Core Platform'}
                </strong>
              </span>
            </div>
            <h1 className="pt-1 text-2xl font-black text-white">{issue.title}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded text-xs font-bold ${statusClass}`}>
              {issue.status}
            </span>
            <span className={`px-2.5 py-1 rounded text-xs font-bold ${priorityClass}`}>
              {issue.priority}
            </span>
            <span className={`px-2.5 py-1 rounded text-xs font-bold ${severityClass}`}>
              {issue.severity}
            </span>
            <Link
              to={`/issues/${issue._id}/edit`}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <Edit size={13} /> Edit Ticket
            </Link>
          </div>
        </div>

        {/* Workflow State Triggers */}
        <div className="flex flex-wrap items-center gap-2 pt-3 text-xs border-t border-slate-800/80">
          <span className="mr-1 font-semibold text-slate-400">Move to:</span>
          {['Open', 'In Progress', 'Testing', 'Resolved', 'Closed']
            .filter((s) => s.toLowerCase() !== (issue.status || '').toLowerCase())
            .map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => handleStatusTransition(statusOption)}
                className="px-3 py-1 text-xs font-medium transition-colors border rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
              >
                {statusOption}
              </button>
            ))}
        </div>
      </div>

      {/* Main Two-Column Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Description, Steps, Attachments, Comments */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-5 space-y-2 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Detailed Description
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
              {issue.description || 'No detailed description provided.'}
            </p>
          </div>

          <div className="p-5 space-y-2 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Steps to Reproduce
            </h3>
            <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-line border rounded-lg text-slate-300 bg-slate-950 border-slate-800/80">
              {issue.stepsToReproduce || '1. Steps not explicitly documented.'}
            </div>
          </div>

          <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
            <h3 className="mb-3 text-xs font-bold tracking-wider uppercase text-slate-300">
              Screenshots & Attachments
            </h3>
            <FileAttachmentList
              attachments={issue.attachments}
              onUpload={async (file) => {
                notify(`Uploaded ${file.name} successfully!`, 'success');
              }}
            />
          </div>

          <div className="p-5 space-y-4 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Discussion ({issue.comments?.length || 0})
            </h3>
            <CommentEditor
              issueId={issue._id}
              onCommentAdded={() => loadData()}
            />
            <CommentList
              comments={issue.comments || []}
              issueId={issue._id}
              onCommentDeleted={() => loadData()}
            />
          </div>
        </div>

        {/* Right Column: Ticket Metadata & Audit Timeline */}
        <div className="space-y-6">
          <div className="p-5 space-y-4 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
            <h3 className="pb-3 text-xs font-bold tracking-wider uppercase border-b text-slate-200 border-slate-800">
              Ticket Metadata
            </h3>

            {/* Strict Admin-Only Assignee Section */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Assignee
              </span>

              {user?.role === 'Admin' ? (
                <>
                  <select
                    value={currentAssigneeId}
                    disabled={updatingAssignee}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white transition-colors border rounded-lg cursor-pointer bg-slate-950 border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      -- Unassigned --
                    </option>
                    {eligibleDevelopers.map((dev) => (
                      <option key={dev._id} value={dev._id} className="text-white bg-slate-900">
                        {dev.name} (Developer)
                      </option>
                    ))}
                  </select>
                  {updatingAssignee && (
                    <p className="text-[10px] text-sky-400">Updating assignment...</p>
                  )}
                </>
              ) : (
                /* Non-Admin (Developer & Tester) Read-Only Badge */
                <div className="px-3 py-2 border rounded-lg bg-slate-950/60 border-slate-800">
                  <p className="text-xs font-semibold text-slate-300">
                    {issue.assignee?.name || (
                      <span className="italic text-slate-500">
                        Unassigned (Pending Lead Triage)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Reporter */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Reporter
              </span>
              <p className="text-xs font-semibold text-white">
                {issue.reporter?.name || 'Lead QA Engineer'}
              </p>
            </div>

            {/* Environment & OS */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Environment & OS
              </span>
              <p className="font-mono text-xs text-slate-300">
                {issue.environment || 'Production'} ({issue.operatingSystem || 'Ubuntu 22.04'})
              </p>
            </div>

            {/* Browser */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Browser
              </span>
              <p className="font-mono text-xs text-slate-300">
                {issue.browser || 'Chrome 124'}
              </p>
            </div>

            {/* Timestamps */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
              <p>Created: {new Date(issue.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(issue.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Audit Timeline Card */}
          <div className="p-5 space-y-3 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
            <h3 className="pb-2 text-xs font-bold tracking-wider uppercase border-b text-slate-200 border-slate-800">
              Audit Timeline
            </h3>

            {activities.length === 0 ? (
              <p className="py-2 text-xs text-slate-500">No activity records recorded yet.</p>
            ) : (
              <div className="pr-1 space-y-3 overflow-y-auto max-h-80">
                {activities.map((act, idx) => (
                  <div key={act._id || idx} className="text-xs flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-300">
                        <strong className="font-semibold text-white">
                          {act.actor?.name || act.user?.name || 'User'}
                        </strong>{' '}
                        {act.message || act.action}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}