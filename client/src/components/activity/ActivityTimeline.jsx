import React from 'react';
import { History } from 'lucide-react';

export default function ActivityTimeline({ activities = [] }) {
  if (activities.length === 0) {
    return <p className="text-xs text-slate-400">No activity logged.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((act) => (
        <div key={act._id} className="relative">
          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-sky-500 shadow-sm" />
          <div>
            <span className="text-xs font-semibold text-slate-800">{act.actor?.name} </span>
            <span className="text-xs text-slate-600">{act.message}</span>
            <span className="block text-[10px] text-slate-400 mt-0.5">
              {new Date(act.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}