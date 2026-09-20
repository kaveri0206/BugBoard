import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROLES } from '../../config/constants';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const res = await projectService.getById(id);
      setProject(res.data.data.project);
      if (user?.role === ROLES.ADMIN) {
        const uRes = await userService.getAll();
        setAllUsers(uRes.data.data.users);
      }
    } catch (e) {
      addToast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    try {
      await projectService.addMember(id, selectedUser);
      addToast('Member assigned', 'success');
      fetchDetails();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error adding member', 'error');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await projectService.removeMember(id, userId);
      addToast('Member removed', 'success');
      fetchDetails();
    } catch (err) {
      addToast('Failed to remove member', 'error');
    }
  };

  if (loading) return <Spinner size="lg" className="text-sky-600 m-8" />;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-sky-600 uppercase">{project?.projectKey}</span>
        <h1 className="text-xl font-bold text-slate-800">{project?.name}</h1>
        <p className="text-xs text-slate-500 mt-1">{project?.description}</p>
      </div>

      <div className="p-6 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Assigned Team Members</h3>
          {user?.role === ROLES.ADMIN && (
            <div className="flex items-center gap-2">
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                options={[
                  { label: 'Select user to add...', value: '' },
                  ...allUsers.map((u) => ({ label: `${u.name} (${u.role})`, value: u._id })),
                ]}
              />
              <Button size="sm" onClick={handleAddMember} disabled={!selectedUser}>
                Add
              </Button>
            </div>
          )}
        </div>

        <Table headers={['Member', 'Email', 'Role', 'Actions']}>
          {project?.members?.map((m) => (
            <tr key={m._id}>
              <td className="px-4 py-3 flex items-center gap-2 font-medium text-slate-800">
                <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full border" />
                {m.name}
              </td>
              <td className="px-4 py-3 text-slate-600">{m.email}</td>
              <td className="px-4 py-3 text-slate-600">{m.role}</td>
              <td className="px-4 py-3">
                {user?.role === ROLES.ADMIN && (
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}