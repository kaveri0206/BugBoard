/**
 * @file AuditLogPage.jsx
 * @description Immutable System Audit Trail ledger rendered with dark UI contrast.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { activityService } from '../../services/activity.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await activityService.getAuditLogs({ page, limit: 25 });
      const rawLogs =
        res.data?.data?.logs ||
        res.data?.logs ||
        res.data?.data ||
        [];
      const rawMeta =
        res.data?.meta || { page, totalPages: 1, totalRecords: rawLogs.length };

      setLogs(Array.isArray(rawLogs) ? rawLogs : []);
      setMeta(rawMeta);
    } catch (e) {
      console.warn('Audit logs load failed:', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading) return <Spinner size="lg" className="m-8 text-sky-500" />;

  return (
    <div className="space-y-6">
      <div className="p-5 border shadow-lg bg-slate-900 border-slate-800 rounded-xl">
        <h1 className="text-xl font-bold text-white">System Audit Trail</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable ledger of administrative actions, defect mutations, and authorization events.
        </p>
      </div>

      <div className="overflow-hidden border shadow-xl bg-slate-900 border-slate-800 rounded-xl">
        {logs.length === 0 ? (
          <div className="p-12 text-xs text-center text-slate-400">
            No audit records found. System is currently initialized in clean state.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log._id} className="transition-colors hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {log.actor?.name || log.user?.name || 'Enterprise Admin'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{log.entityType || 'Defect'}</td>
                    <td className="max-w-md px-4 py-3 truncate text-slate-300">
                      {log.message || JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 border-t border-slate-800">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalRecords={meta.totalRecords}
            onPageChange={fetchLogs}
          />
        </div>
      </div>
    </div>
  );
}