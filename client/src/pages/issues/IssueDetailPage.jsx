import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  const fetchFullDetails = async () => {
    try {
      const [issueRes, commentsRes, actRes] = await Promise.all([
        issueService.getById(id),
        commentService.getByIssue(id),
        activityService.getIssueActivities(id),
      ]);
      setIssue(issueRes.data.data.issue);
      setComments(commentsRes.data.data.comments);
      setActivities(actRes.data.data.activities);

      if (user?.role === ROLES.ADMIN) {
        const uRes = await userService.getAll();
        setUsers(uRes.data.data.users);
      }
    } catch (err) {
      addToast('Failed to load issue details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullDetails();
  }, [id]);

  const handleStatusChange = async (targetStatus) => {
    try {
      await issueService.changeStatus(issue._id, targetStatus);
      addToast(`Status updated to ${targetStatus}`, 'success');
      fetchFullDetails();
    } catch (err) {
      addToast(err.response?.data?.message || 'Workflow transition rejected', 'error');
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    try {
      await issueService.assign(issue._id, newAssigneeId);
      addToast('Assignee updated', 'success');
      fetchFullDetails();
    } catch (err) {
      addToast('Failed to change assignee', 'error');
    }
  };

  const handlePostComment = async (content) => {
    try {
      await commentService.create(issue._id, { content });
      addToast('Comment added', 'success');
      fetchFullDetails();
    } catch (err) {
      addToast('Failed to post comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.delete(commentId);
      addToast('Comment removed', 'success');
      fetchFullDetails();
    } catch (err) {
      addToast('Failed to delete comment', 'error');
    }
  };

  if (loading) return <Spinner size="lg" className="text-sky-600 m-8" />;
  if (!issue) return <p className="p-8 text-center text-slate-500">Ticket not found</p>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-4">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase">{issue.issueKey}</span>
            <h1 className="text-xl font-bold text-slate-800 mt-0.5">{issue.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${PRIORITY_COLORS[issue.priority]}`}>
              {issue.priority}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${SEVERITY_COLORS[issue.severity]}`}>
              {issue.severity}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <StatusTransitionMenu
            currentStatus={issue.status}
            onSelectStatus={handleStatusChange}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Detailed Description
              </h3>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {issue.description}
              </p>
            </div>

            {issue.stepsToReproduce && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Steps to Reproduce
                </h3>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {issue.stepsToReproduce}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Screenshots & Attachments
              </h3>
              <FileAttachmentList attachments={issue.attachments} />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Discussion ({comments.length})
              </h3>
              <CommentList comments={comments} onDeleteComment={handleDeleteComment} />
              <CommentEditor onSubmit={handlePostComment} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ticket Metadata
              </h4>

              <div>
                <span className="text-[11px] text-slate-400 block">Assignee</span>
                {user?.role === ROLES.ADMIN ? (
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
                <span className="text-xs font-semibold text-slate-700">{issue.reporter?.name}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Environment & OS</span>
                <span className="text-xs text-slate-700">
                  {issue.environment} ({issue.operatingSystem})
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
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
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