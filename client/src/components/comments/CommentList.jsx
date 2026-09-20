import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../config/constants';
import { Trash2 } from 'lucide-react';

export default function CommentList({ comments = [], onDeleteComment }) {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canDelete =
          user?.role === ROLES.ADMIN || user?._id === comment.author?._id;

        return (
          <div key={comment._id} className="p-4 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={comment.author?.avatar}
                  alt={comment.author?.name}
                  className="w-6 h-6 rounded-full border border-slate-200"
                />
                <span className="text-xs font-semibold text-slate-800">{comment.author?.name}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              {canDelete && (
                <button
                  onClick={() => onDeleteComment(comment._id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        );
      })}
    </div>
  );
}