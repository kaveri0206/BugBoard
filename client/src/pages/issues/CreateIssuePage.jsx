/**
 * @file CreateIssuePage.jsx
 * @description Defect reporting page styled with crisp dark theme and high-contrast form controls.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import AIAssistantModal from '../../components/ai/AIAssistantModal';
import { Sparkles, ArrowLeft, Send } from 'lucide-react';
import { PRIORITY, SEVERITY } from '../../config/constants';

const extractProjectsFromResponse = (res) => {
  if (!res) return [];
  const body = res.data !== undefined ? res.data : res;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.projects)) return body.projects;
  if (Array.isArray(body?.data?.projects)) return body.data.projects;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

export default function CreateIssuePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    project: '',
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    severity: 'Medium',
    priority: 'Medium',
    labels: '',
  });

  const notify = useCallback((msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  }, [addToast]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectService.getAll();
        const pList = extractProjectsFromResponse(res);
        setProjects(pList);
        if (pList.length > 0) {
          setFormData((prev) => ({ ...prev, project: pList[0]._id }));
        }
      } catch (err) {
        notify('Failed to load project list', 'error');
      }
    };
    loadProjects();
  }, [notify]);

  const handleApplyAiSuggestions = (analysis) => {
    setFormData((prev) => ({
      ...prev,
      severity: analysis.severity || prev.severity,
      priority: analysis.priority || prev.priority,
      labels: analysis.labels ? analysis.labels.join(', ') : prev.labels,
      expectedResult: analysis.testCases ? analysis.testCases.join('\n') : prev.expectedResult,
    }));
    notify('AI triage recommendations applied to form!', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      notify('Please select a target project', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        labels: formData.labels ? formData.labels.split(',').map((s) => s.trim()) : [],
      };
      const res = await issueService.create(payload);
      const created = res.data?.data?.issue || res.data?.issue || res.data?.data;
      notify('Defect ticket created successfully!', 'success');
      navigate(`/issues/${created?._id || ''}`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const severities = Object.values(SEVERITY || { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' });
  const priorities = Object.values(PRIORITY || { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 p-5 border shadow-lg sm:flex-row sm:items-center bg-slate-900 border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Report New Defect</h1>
            <p className="text-xs text-slate-400 mt-0.5">Log an enterprise issue with reproduction steps and target severity.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border rounded-lg shadow-lg bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 border-sky-500/40 text-sky-300 shadow-sky-500/10 shrink-0"
        >
          <Sparkles size={15} className="text-sky-400" />
          Gemini AI Assist
        </button>
      </div>

      {/* Main Form Container */}
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-5 border shadow-xl bg-slate-900 border-slate-800 rounded-xl sm:p-8"
      >
        {/* Project Target */}
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
            Target Project Workspace <span className="text-rose-400">*</span>
          </label>
          <select
            required
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id} className="text-white bg-slate-900">
                {p.name} ({p.projectKey || p.key || 'PROJ'})
              </option>
            ))}
          </select>
        </div>

        {/* Bug Title */}
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
            Defect Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Stripe checkout webhook throws 500 on duplicate idempotency key"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
            Detailed Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Describe the defect, failure environment, and unexpected behavior..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 text-sm leading-relaxed text-white transition-colors border rounded-lg bg-slate-950 border-slate-700 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Severity & Priority */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
              Severity Classification
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            >
              {severities.map((s) => (
                <option key={s} value={s} className="text-white bg-slate-900">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
              Priority Urgency
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            >
              {priorities.map((p) => (
                <option key={p} value={p} className="text-white bg-slate-900">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Labels / Tags */}
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
            Labels / Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="billing, authentication, webhook, api"
            value={formData.labels}
            onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
            Steps to Reproduce
          </label>
          <textarea
            rows={3}
            placeholder="1. Navigate to billing settings...&#10;2. Click initiate checkout...&#10;3. Observe 500 status payload"
            value={formData.stepsToReproduce}
            onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
            className="w-full p-3 text-sm leading-relaxed text-white transition-colors border rounded-lg bg-slate-950 border-slate-700 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Expected Result */}
        <div>
          <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-300">
            Expected Result
          </label>
          <textarea
            rows={2}
            placeholder="Webhook returns 200 OK and deduplicates the incoming transaction gracefully."
            value={formData.expectedResult}
            onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
            className="w-full p-3 text-sm leading-relaxed text-white transition-colors border rounded-lg bg-slate-950 border-slate-700 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span>Creating Defect...</span>
            ) : (
              <>
                <Send size={14} />
                <span>Create Defect Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={formData.title}
        description={formData.description}
        onApplySuggestions={handleApplyAiSuggestions}
      />
    </div>
  );
}