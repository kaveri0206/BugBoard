import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { aiService } from '../../services/ai.service';
import { Sparkles, Check } from 'lucide-react';

export default function AIAssistantModal({ isOpen, onClose, title, description, onApplySuggestions }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.analyzeIssue({ title, description });
      setAnalysis(res.data.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to communicate with AI Assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Bug Assistant (Google Gemini Powered)" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {!analysis && !loading && (
          <div className="text-center py-6">
            <Sparkles className="mx-auto text-sky-500 mb-2" size={32} />
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
              Click below to parse your bug title & description with Gemini. It will automatically suggest priority, severity, QA test cases, and tags.
            </p>
            <Button onClick={handleGenerate} variant="primary" size="md">
              Run AI Analysis
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Spinner size="lg" className="text-sky-600 mb-3" />
            <p className="text-xs text-slate-500 font-medium">Synthesizing bug report parameters...</p>
          </div>
        )}

        {error && <p className="text-xs text-rose-600 text-center">{error}</p>}

        {analysis && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-lg">
              <div>
                <span className="font-semibold text-slate-500">Suggested Severity:</span>
                <p className="font-bold text-slate-800">{analysis.severity}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Suggested Priority:</span>
                <p className="font-bold text-slate-800">{analysis.priority}</p>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Recommended Labels:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.labels?.map((l, i) => (
                  <span key={i} className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-medium">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Generated Test Cases:</span>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
                {analysis.testCases?.map((tc, i) => (
                  <li key={i}>{tc}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={onClose}>
                Dismiss
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onApplySuggestions(analysis);
                  onClose();
                }}
              >
                Apply Suggestions to Form
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}