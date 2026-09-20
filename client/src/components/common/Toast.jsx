import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
    error: <AlertCircle size={16} className="text-rose-500" />,
    info: <Info size={16} className="text-sky-500" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white',
    error: 'border-rose-200 bg-white',
    info: 'border-sky-200 bg-white',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm max-w-sm transition-all animate-slide-up ${borders[type]}`}
    >
      {icons[type]}
      <span className="text-slate-700 text-xs font-medium flex-1">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <X size={14} />
      </button>
    </div>
  );
}