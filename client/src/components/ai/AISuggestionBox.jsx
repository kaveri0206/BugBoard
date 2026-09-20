import React from 'react';
import Badge from '../common/Badge';
import { Sparkles } from 'lucide-react';

export default function AISuggestionBox({ suggestion }) {
  if (!suggestion) return null;

  return (
    <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-sky-600" />
        <h4 className="text-xs font-bold text-sky-900">Gemini AI Recommendations</h4>
      </div>

      <p className="text-xs text-slate-700">{suggestion.summary}</p>

      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 bg-white px-2 py-1 border rounded shadow-xs">
          <span className="text-slate-400 text-[10px]">Severity:</span>
          <span className="font-semibold text-slate-800">{suggestion.severity}</span>
        </div>
        <div className="flex items-center gap-1 bg-white px-2 py-1 border rounded shadow-xs">
          <span className="text-slate-400 text-[10px]">Priority:</span>
          <span className="font-semibold text-slate-800">{suggestion.priority}</span>
        </div>
      </div>

      {suggestion.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestion.labels.map((l, i) => (
            <Badge key={i} className="bg-sky-100 text-sky-800 border-sky-200">
              {l}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}