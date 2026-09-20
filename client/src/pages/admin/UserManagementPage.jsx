import React, { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { useToast } from '../../hooks/useToast';
import Table from '../../components/common/Table';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { ROLES } from '../../config/constants';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll();
      setUsers(res.data.data.users);
    } catch (e) {
      addToast('Failed to fetch user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateRole(userId, newRole);
      addToast('Role updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleStatus(userId);
      addToast('User status updated', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  if (loading) return <Spinner size="lg" className="text-sky-600 m-8" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">User Management Console</h1>
        <p className="text-xs text-slate-500">Configure roles and authorization privileges.</p>
      </div>

      <Table headers={['User', 'Email', 'Role', 'Status', 'Assigned Tickets', 'Actions']}>
        {users.map((u) => (
          <tr key={u._id} className="hover:bg-slate-50">
            <td className="px-4 py-3 flex items-center gap-2 font-medium text-slate-800">
              <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full border" />
              {u.name}
            </td>
            <td className="px-4 py-3 text-slate-600">{u.email}</td>
            <td className="px-4 py-3 w-40">
              <Select
                value={u.role}
                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                options={Object.values(ROLES).map((r) => ({ label: r, value: r }))}
              />
            </td>
            <td className="px-4 py-3">
              <Badge
                className={
                  u.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }
              >
                {u.isActive ? 'Active' : 'Disabled'}
              </Badge>
            </td>
            <td className="px-4 py-3 text-slate-700 font-semibold">{u.assignedIssuesCount || 0}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => handleToggleStatus(u._id)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                {u.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}