import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { projectService } from '../../services/project.service';
import { issueService } from '../../services/issue.service';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import AIAssistantModal from '../../components/ai/AIAssistantModal';
import DuplicateWarningModal from '../../components/issues/DuplicateWarningModal';
import { ISSUE_SEVERITY, ISSUE_PRIORITY } from '../../config/constants';
import { Sparkles } from 'lucide-react';

export default function CreateIssuePage() {
  const { data: projectData } = useFetch(projectService.getAll);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    project: '',
    title: '',
    description: '',
    severity: ISSUE_SEVERITY.MEDIUM,
    priority: ISSUE_PRIORITY.MEDIUM,
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    labels: '',
  });

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      addToast('Please select a target project', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Run Duplicate Bug Detection
      const dupCheck = await issueService.checkDuplicates({
        projectId: formData.project,
        title: formData.title,
        description: formData.description,
      });

      if (dupCheck.data.data.duplicates?.length > 0) {
        setDuplicates(dupCheck.data.data.duplicates);
        setDuplicateModalOpen(true);
        setLoading(false);
        return;
      }

      await executeCreate();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating bug ticket', 'error');
      setLoading(false);
    }
  };

  const executeCreate = async () => {
    setLoading(true);
    try {
      const labelsArray = formData.labels
        ? formData.labels.split(',').map((l) => l.trim()).filter(Boolean)
        : [];

      const res = await issueService.create({
        ...formData,
        labels: labelsArray,
      });

      addToast('Defect ticket created', 'success');
      navigate(`/issues/${res.data.data.issue._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit bug report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAi = (analysis) => {
    setFormData((prev) => ({
      ...prev,
      severity: analysis.severity || prev.severity,
      priority: analysis.priority || prev.priority,
      labels: analysis.labels ? analysis.labels.join(', ') : prev.labels,
      expectedResult: analysis.testCases ? analysis.testCases.join('\n') : prev.expectedResult,
    }));
    addToast('AI recommendations populated', 'info');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Report Defect / Bug</h1>
          <p className="text-xs text-slate-500">Submit a comprehensive bug report to engineering.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setAiModalOpen(true)}
          disabled={!formData.title}
          className="border border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100"
        >
          <Sparkles size={14} className="mr-1.5" /> AI Assist
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <Select
          label="Target Project"
          required
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          options={[
            { label: 'Select project...', value: '' },
            ...(projectData?.projects?.map((p) => ({ label: `${p.name} (${p.projectKey})`, value: p._id })) || []),
          ]}
        />

        <Input
          label="Issue Title"
          required
          placeholder="e.g., Stripe webhook throws 500 on duplicate charge authorization"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
          <textarea
            rows={4}
            required
            className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Severity"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            options={Object.values(ISSUE_SEVERITY).map((s) => ({ label: s, value: s }))}
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={Object.values(ISSUE_PRIORITY).map((p) => ({ label: p, value: p }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Steps to Reproduce</label>
          <textarea
            rows={3}
            className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={formData.stepsToReproduce}
            onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
          />
        </div>

        <Input
          label="Comma Separated Labels"
          placeholder="backend, payments, security"
          value={formData.labels}
          onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={() => navigate('/issues')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Create Issue Ticket
          </Button>
        </div>
      </form>

      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={formData.title}
        description={formData.description}
        onApplySuggestions={handleApplyAi}
      />

      <DuplicateWarningModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onProceed={() => {
          setDuplicateModalOpen(false);
          executeCreate();
        }}
        duplicates={duplicates}
      />
    </div>
  );
}