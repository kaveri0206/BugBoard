/**
 * @file EditIssuePage.jsx
 * @description Modifies existing defect ticket attributes.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { ISSUE_SEVERITY, ISSUE_PRIORITY } from '../../config/constants';

export default function EditIssuePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: ISSUE_SEVERITY?.MEDIUM || 'Medium',
    priority: ISSUE_PRIORITY?.MEDIUM || 'Medium',
    environment: '',
    browser: '',
    operatingSystem: '',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    dueDate: '',
  });

  const notify = (msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  };

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await issueService.getById(id);
        const issue = res.data?.data?.issue || res.data?.issue || res.data?.data;
        if (issue) {
          setFormData({
            title: issue.title || '',
            description: issue.description || '',
            severity: issue.severity || 'Medium',
            priority: issue.priority || 'Medium',
            environment: issue.environment || '',
            browser: issue.browser || '',
            operatingSystem: issue.operatingSystem || '',
            stepsToReproduce: issue.stepsToReproduce || '',
            expectedResult: issue.expectedResult || '',
            actualResult: issue.actualResult || '',
            dueDate: issue.dueDate ? issue.dueDate.substring(0, 10) : '',
          });
        }
      } catch (err) {
        notify('Failed to load issue data for editing', 'error');
        navigate('/issues');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await issueService.update(id, {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      });
      notify('Issue updated successfully', 'success');
      navigate(`/issues/${id}`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update issue', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" className="text-sky-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Edit Issue Ticket</h1>
          <p className="text-xs text-slate-500">Update issue attributes and specifications.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-4 bg-white border shadow-sm rounded-xl border-slate-200"
      >
        <Input
          label="Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div>
          <label className="block mb-1 text-xs font-semibold text-slate-700">Description</label>
          <textarea
            rows={4}
            required
            className="w-full p-3 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Severity"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            options={Object.values(ISSUE_SEVERITY || { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' }).map((s) => ({
              label: s,
              value: s,
            }))}
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={Object.values(ISSUE_PRIORITY || { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' }).map((p) => ({
              label: p,
              value: p,
            }))}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Environment"
            value={formData.environment}
            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
          />
          <Input
            label="Browser"
            value={formData.browser}
            onChange={(e) => setFormData({ ...formData, browser: e.target.value })}
          />
          <Input
            label="Operating System"
            value={formData.operatingSystem}
            onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-slate-700">Steps to Reproduce</label>
          <textarea
            rows={3}
            className="w-full p-3 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            value={formData.stepsToReproduce}
            onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">Expected Result</label>
            <textarea
              rows={2}
              className="w-full p-3 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              value={formData.expectedResult}
              onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">Actual Result</label>
            <textarea
              rows={2}
              className="w-full p-3 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              value={formData.actualResult}
              onChange={(e) => setFormData({ ...formData, actualResult: e.target.value })}
            />
          </div>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={() => navigate(`/issues/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}