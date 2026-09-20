import React, { useState } from 'react';
import Button from '../common/Button';

export default function CommentEditor({ onSubmit, loading = false }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a technical comment or mention a colleague with @name..."
        className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      />
      <div className="flex justify-end mt-2">
        <Button type="submit" size="sm" loading={loading} disabled={!content.trim()}>
          Post Comment
        </Button>
      </div>
    </form>
  );
}