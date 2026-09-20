import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

export default function FileAttachmentList({ attachments = [] }) {
  if (attachments.length === 0) {
    return <p className="text-xs text-slate-400">No attachments provided.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {attachments.map((file, idx) => (
        <div
          key={idx}
          className="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={18} className="text-slate-500 shrink-0" />
            <span className="text-xs text-slate-700 font-medium truncate">{file.fileName}</span>
          </div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slate-500 hover:text-sky-600 rounded"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ))}
    </div>
  );
}