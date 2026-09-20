import React from 'react';
import Badge from '../common/Badge';
import { CopyAlert } from 'lucide-react';

export default function DuplicateAnalysisView({ matches = [] }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <CopyAlert size={16} className="text-amber-600" />
        <h4 className="text-xs font-bold text-amber-900">
          Potential Duplicate Bugs ({matches.length})
        </h4>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {matches.map((item) => (
          <div
            key={item.issueKey}
            className="p-2.5 bg-white border border-amber-200 rounded-lg flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-sky-600 mr-2">{item.issueKey}</span>
              <span className="text-slate-800 font-medium">{item.title}</span>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
              {item.similarityPercentage}% Match
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}