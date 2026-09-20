/**
 * @file AuditLogPage.jsx
 * @description Enterprise Audit & Security Log view displaying administrative mutations,
 * state changes, access controls, and defect lifecycle activities.
 */

import React, { useState, useEffect, useCallback } from 'react';
import * as activityServiceModule from '../../services/activity.service';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/common/Spinner';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Clock,
  Filter,
} from 'lucide-react';

export default function AuditLogPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const { addToast } = useToast();

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);

      // Safe service resolution across named/default exports
      const service =
        activityServiceModule.activityService ||
        activityServiceModule.default ||
        activityServiceModule;

      let res;
      if (service && typeof service.getAll === 'function') {
        res = await service.getAll();
      } else if (service && typeof service.getActivities === 'function') {
        res = await service.getActivities();
      } else {
        // Direct API fallback
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        res = await api.get('/activities', { headers });
      }

      const data =
        res.data?.data?.activities ||
        res.data?.activities ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Audit trail load error:', err);
      if (typeof addToast === 'function') {
        addToast('Failed to load system audit trail', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('REASSIGN') || act.includes('ASSIGN')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (act.includes('STATUS') || act.includes('RESOLVE') || act.includes('CLOSE')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (act.includes('DELETE') || act.includes('BREACH') || act.includes('REVOKE')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  };

  const filtered = activities.filter((act) => {
    if (filterAction === 'ALL') return true;
    return (act.action || '').toUpperCase().includes(filterAction);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 p-6 border shadow-xl bg-slate-900 border-slate-800 rounded-2xl md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 border rounded-xl bg-sky-500/10 text-sky-400 border-sky-500/20">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-2xl font-black text-white">System Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-400">
            Immutable ledger of administrative actions, defect mutations, and authorization events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAuditLogs}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto text-xs">
        <span className="flex items-center gap-1 font-semibold text-slate-400 shrink-0">
          <Filter size={13} /> Filter Action:
        </span>
        {['ALL', 'REASSIGN', 'STATUS', 'CREATED', 'SECURITY'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterAction(type)}
            className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
              filterAction === type
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main Records Table */}
      <div className="overflow-hidden border shadow-xl bg-slate-900 border-slate-800 rounded-2xl">
        {loading ? (
          <div className="flex justify-center p-16">
            <Spinner size="lg" className="text-sky-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 space-y-2 text-center">
            <ShieldAlert size={36} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">
              No audit records found.
            </p>
            <p className="text-xs text-slate-500">
              Administrative updates and defect state changes will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">Actor / User</th>
                  <th className="py-3.5 px-5">Event Action</th>
                  <th className="py-3.5 px-5">Message & Details</th>
                  <th className="py-3.5 px-5">Target Ticket</th>
                </tr>
              </thead>
              <tbody className="font-normal divide-y divide-slate-800/80">
                {filtered.map((log, index) => {
                  const actorName =
                    log.actor?.name || log.user?.name || 'System / Admin';
                  const actorRole = log.actor?.role || log.user?.role || 'System';
                  const issueKey = log.issue?.issueKey || (log.issue ? 'Defect' : '—');

                  return (
                    <tr
                      key={log._id || index}
                      className="transition-colors hover:bg-slate-800/40"
                    >
                      <td className="py-3.5 px-5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-500 shrink-0" />
                          <span>
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleString()
                              : 'Just now'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] border border-slate-700">
                            {actorName.charAt(0)}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{actorName}</p>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">
                              {actorRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action || 'MUTATION'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-slate-200 max-w-md">
                        <p className="leading-relaxed line-clamp-2">
                          {log.message || 'Administrative state update executed.'}
                        </p>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap font-mono text-[11px]">
                        {issueKey !== '—' ? (
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                            {issueKey}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}