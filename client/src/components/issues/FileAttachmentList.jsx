/**
 * @file FileAttachmentList.jsx
 * @description Renders screenshots, stack traces, and image attachments with preview modals and file upload trigger.
 */

import React, { useState } from 'react';
import { Paperclip, Download, Eye, Image as ImageIcon, FileText, Upload, X } from 'lucide-react';

export default function FileAttachmentList({ attachments = [], onUpload }) {
  const [previewImage, setPreviewImage] = useState(null);

  // Default fallback attachments if ticket has none
  const displayAttachments = attachments && attachments.length > 0 ? attachments : [
    {
      _id: 'att-1',
      filename: 'console-error-stacktrace.png',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      size: '248 KB',
      uploadedAt: new Date().toLocaleDateString(),
      type: 'image/png',
    },
    {
      _id: 'att-2',
      filename: 'network-payload-dump.json',
      url: '#',
      size: '18 KB',
      uploadedAt: new Date().toLocaleDateString(),
      type: 'application/json',
    }
  ];

  const handleSimulatedUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Attached Files ({displayAttachments.length})
        </span>

        <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-300">
          <Upload size={12} className="text-sky-600" />
          <span>Upload File</span>
          <input
            type="file"
            className="hidden"
            accept="image/*,.json,.txt,.log,.pdf"
            onChange={handleSimulatedUpload}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {displayAttachments.map((item, idx) => {
          const isImg = item.type?.includes('image') || item.filename?.match(/\.(png|jpe?g|webp|gif)$/i);

          return (
            <div
              key={item._id || idx}
              className="flex items-center justify-between gap-3 p-3 transition-all border shadow-sm bg-slate-50 border-slate-200 rounded-xl hover:border-sky-300 group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex items-center justify-center font-bold border rounded-lg w-9 h-9 bg-sky-50 border-sky-200 shrink-0 text-sky-600">
                  {isImg ? <ImageIcon size={18} /> : <FileText size={18} />}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold truncate text-slate-800" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.size || '120 KB'} • {item.uploadedAt || 'Recently uploaded'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isImg && item.url && item.url !== '#' && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(item.url)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-white transition-colors"
                    title="Preview Image"
                  >
                    <Eye size={14} />
                  </button>
                )}
                {item.url && item.url !== '#' ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-white transition-colors"
                    title="Download File"
                  >
                    <Download size={14} />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert(`Downloading attachment: ${item.filename}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-white transition-colors"
                    title="Download File"
                  >
                    <Download size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/80">
              <span className="text-xs font-bold tracking-wider text-white uppercase">Attachment Preview</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 transition-colors rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center justify-center p-4 bg-slate-950">
              <img
                src={previewImage}
                alt="Defect Attachment Preview"
                className="max-h-[70vh] rounded-lg object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}