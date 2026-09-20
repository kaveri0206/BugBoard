import React from 'react';

export default function Table({ headers = [], children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
      <table className={`w-full text-left border-collapse text-sm ${className}`}>
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
}