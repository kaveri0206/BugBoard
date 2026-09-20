import React, { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';

export default function CommentItem({
  comment,
  canDelete = false,
  canEdit = false,
  onDelete,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);

  const handleSave = () => {
    if (!editedText.trim()) return;
    if (onUpdate) onUpdate(comment._id, editedText);
    setIsEditing(false);
  };

  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
      <div className="flex items-center justify-between">
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

        <div className="flex items-center gap-1">
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-sky-600 p-1 rounded"
              title="Edit comment"
            >
              <Edit2 size={13} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              className="text-slate-400 hover:text-rose-600 p-1 rounded"
              title="Delete comment"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            className="w-full p-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded flex items-center gap-1"
            >
              <X size={12} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 text-[11px] bg-sky-600 text-white rounded hover:bg-sky-700 flex items-center gap-1"
            >
              <Check size={12} /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>
      )}
    </div>
  );
}