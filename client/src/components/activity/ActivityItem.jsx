import React from 'react';

export default function ActivityItem({ activity }) {
  return (
    <div className="relative pl-6 pb-4">
      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-sky-500 shadow-sm" />
      <div>
        <span className="text-xs font-semibold text-slate-800">
          {activity.actor?.name || 'System'}{' '}
        </span>
        <span className="text-xs text-slate-600">{activity.message}</span>
        <span className="block text-[10px] text-slate-400 mt-0.5">
          {new Date(activity.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}