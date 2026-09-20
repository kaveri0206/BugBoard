import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { projectService } from '../../services/project.service';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../config/constants';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { Link } from 'react-router-dom';

export default function ProjectListPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(projectService.getAll);
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', projectKey: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectService.create(formData);
      addToast('Project created successfully', 'success');
      setModalOpen(false);
      setFormData({ name: '', projectKey: '', description: '' });
      refetch();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Project Directory</h1>
          <p className="text-xs text-slate-500">View and manage system software projects.</p>
        </div>
        {user?.role === ROLES.ADMIN && (
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            + Create Project
          </Button>
        )}
      </div>

      <Table headers={['Key', 'Name', 'Members', 'Status', 'Owner', 'Actions']}>
        {data?.projects?.map((proj) => (
          <tr key={proj._id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-bold text-sky-600">{proj.projectKey}</td>
            <td className="px-4 py-3 font-medium text-slate-800">{proj.name}</td>
            <td className="px-4 py-3 text-xs text-slate-600">{proj.members?.length || 0} members</td>
            <td className="px-4 py-3">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {proj.status}
              </Badge>
            </td>
            <td className="px-4 py-3 text-xs text-slate-600">{proj.owner?.name}</td>
            <td className="px-4 py-3">
              <Link to={`/projects/${proj._id}`} className="text-xs text-sky-600 hover:underline">
                View &rarr;
              </Link>
            </td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Project Key (2-6 letters, e.g., PAY, CRM)"
            required
            value={formData.projectKey}
            onChange={(e) => setFormData({ ...formData, projectKey: e.target.value.toUpperCase() })}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}