/**
 * @file UserManagementPage.jsx
 * @description Enterprise RBAC user directory with role assignment and account state control.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/user.service';
import { useToast } from '../../hooks/useToast';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { ROLES } from '../../config/constants';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const notify = useCallback((msg, type = 'info') => {
    if (typeof addToast === 'function') addToast(msg, type);
  }, [addToast]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      const uList = res.data?.data?.users || res.data?.users || res.data?.data || [];
      setUsers(Array.isArray(uList) ? uList : []);
    } catch (e) {
      notify('Failed to fetch user directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await userService.updateRole(userId, newRole);
      notify(`Role updated to ${newRole} successfully!`, 'success');
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update role', 'error');
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setUpdatingId(userId);
    try {
      const res = await userService.toggleStatus(userId);
      const updatedUser = res.data?.data?.user || res.data?.user;
      notify('User account status toggled', 'success');
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, isActive: updatedUser ? updatedUser.isActive : !u.isActive }
            : u
        )
      );
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to toggle status', 'error');
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner size="lg" className="m-8 text-sky-500" />;

  return (
    <div className="space-y-6">
      <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
        <h1 className="text-xl font-bold text-white">User Management Console</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure security roles (Admin, Developer, Tester) and control account access.
        </p>
      </div>

      <div className="overflow-hidden border shadow-xl bg-slate-900 border-slate-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Tickets</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="transition-colors hover:bg-slate-800/40">
                  <td className="flex items-center gap-2 px-4 py-3 font-semibold text-white">
                    <div className="flex items-center justify-center text-xs font-bold uppercase border rounded-full w-7 h-7 bg-sky-500/10 text-sky-400 border-sky-500/20">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3 w-44">
                    <select
                      value={u.role}
                      disabled={updatingId === u._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="Admin" className="text-white bg-slate-900">Admin</option>
                      <option value="Developer" className="text-white bg-slate-900">Developer</option>
                      <option value="Tester" className="text-white bg-slate-900">Tester</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        u.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {u.isActive !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {u.assignedIssuesCount || 0}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      disabled={updatingId === u._id}
                      className={`text-xs font-semibold underline transition-colors disabled:opacity-50 ${
                        u.isActive !== false
                          ? 'text-rose-400 hover:text-rose-300'
                          : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}