/**
 * @file IssueDetailPage.jsx
 * @description In-depth defect analysis view with status workflow transitions, comments, and audit log.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { issueService } from '../../services/issue.service';
import { commentService } from '../../services/comment.service';
import { activityService } from '../../services/activity.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import StatusTransitionMenu from '../../components/issues/StatusTransitionMenu';
import FileAttachmentList from '../../components/issues/FileAttachmentList';
import CommentList from '../../components/comments/CommentList';
import CommentEditor from '../../components/comments/CommentEditor';
import ActivityTimeline from '../../components/activity/ActivityTimeline';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import { STATUS_COLORS, PRIORITY_COLORS, SEVERITY_COLORS, ROLES } from '../../config/constants';

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const notify = useCallback((msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  }, [addToast]);

  const fetchFullDetails = useCallback(async () => {
    try {
      const [issueRes, commentsRes, actRes] = await Promise.all([
        issueService.getById(id).catch(() => ({ data: {} })),
        commentService.getByIssue(id).catch(() => ({ data: {} })),
        activityService.getIssueActivities(id).catch(() => ({ data: {} })),
      ]);

      const rawIssue = issueRes.data?.data?.issue || issueRes.data?.issue || issueRes.data?.data;
      const rawComments = commentsRes.data?.data?.comments || commentsRes.data?.comments || [];
      const rawActivities = actRes.data?.data?.activities || actRes.data?.activities || [];

      setIssue(rawIssue || null);
      setComments(Array.isArray(rawComments) ? rawComments : []);
      setActivities(Array.isArray(rawActivities) ? rawActivities : []);

      if (user?.role === ROLES.ADMIN || user?.role === 'Admin') {
        const uRes = await userService.getAll().catch(() => ({ data: {} }));
        const uList = uRes.data?.data?.users || uRes.data?.users || [];
        setUsers(Array.isArray(uList) ? uList : []);
      }
    } catch (err) {
      notify('Failed to load issue details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, user?.role, notify]);

  useEffect(() => {
    fetchFullDetails();
  }, [fetchFullDetails]);

  const handleStatusChange = async (targetStatus) => {
    try {
      await issueService.changeStatus(issue._id, targetStatus);
      notify(`Status updated to ${targetStatus}`, 'success');
      fetchFullDetails();
    } catch (err) {
      notify(err.response?.data?.message || 'Workflow transition rejected', 'error');
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    try {
      await issueService.assign(issue._id, newAssigneeId);
      notify('Assignee updated', 'success');
      fetchFullDetails();
    } catch (err) {
      notify('Failed to change assignee', 'error');
    }
  };

  const handlePostComment = async (content) => {
    try {
      await commentService.create(issue._id, { content });
      notify('Comment added', 'success');
      fetchFullDetails();
    } catch (err) {
      notify('Failed to post comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.delete(commentId);
      notify('Comment removed', 'success');
      fetchFullDetails();
    } catch (err) {
      notify('Failed to delete comment', 'error');
    }
  };

  if (loading) return <Spinner size="lg" className="m-8 text-sky-600" />;
  if (!issue) return <p className="p-8 text-center text-slate-500">Ticket not found</p>;

  const statusClass = STATUS_COLORS?.[issue.status] || 'bg-slate-100 text-slate-700';
  const priorityClass = PRIORITY_COLORS?.[issue.priority] || 'bg-slate-100 text-slate-700';
  const severityClass = SEVERITY_COLORS?.[issue.severity] || 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border rounded-xl border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b">
          <div>
            <span className="font-mono text-xs font-bold uppercase text-sky-600">{issue.issueKey}</span>
            <h1 className="text-xl font-bold text-slate-800 mt-0.5">{issue.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusClass}>{issue.status}</Badge>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityClass}`}>
              {issue.priority}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${severityClass}`}>
              {issue.severity}
            </span>
            <Link
              to={`/issues/${issue._id}/edit`}
              className="px-3 py-1 text-xs font-semibold transition-colors border rounded bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
            >
              Edit Ticket
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <StatusTransitionMenu
            currentStatus={issue.status}
            onSelectStatus={handleStatusChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                Detailed Description
              </h3>
              <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                {issue.description}
              </p>
            </div>

            {issue.stepsToReproduce && (
              <div>
                <h3 className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                  Steps to Reproduce
                </h3>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                  {issue.stepsToReproduce}
                </p>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
                Screenshots & Attachments
              </h3>
              <FileAttachmentList attachments={issue.attachments || []} />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="mb-4 text-sm font-bold text-slate-800">
                Discussion ({comments.length})
              </h3>
              <CommentList comments={comments} onDeleteComment={handleDeleteComment} />
              <CommentEditor onSubmit={handlePostComment} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 space-y-3 border bg-slate-50 border-slate-200 rounded-xl">
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-700">
                Ticket Metadata
              </h4>

              <div>
                <span className="text-[11px] text-slate-400 block">Assignee</span>
                {user?.role === ROLES.ADMIN || user?.role === 'Admin' ? (
                  <Select
                    value={issue.assignee?._id || ''}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    options={[
                      { label: 'Unassigned', value: '' },
                      ...users.map((u) => ({ label: u.name, value: u._id })),
                    ]}
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-700">
                    {issue.assignee?.name || 'Unassigned'}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Reporter</span>
                <span className="text-xs font-semibold text-slate-700">{issue.reporter?.name || 'Automated'}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Environment & OS</span>
                <span className="text-xs text-slate-700">
                  {issue.environment || 'N/A'} ({issue.operatingSystem || 'N/A'})
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Due Date</span>
                <span className="text-xs text-slate-700">
                  {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'None scheduled'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="mb-3 text-xs font-bold tracking-wider uppercase text-slate-700">
                Audit Timeline
              </h4>
              <ActivityTimeline activities={activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}