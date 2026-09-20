import React, { useState, useEffect } from 'react';
import { activityService } from '../../services/activity.service';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await activityService.getAuditLogs({ page, limit: 25 });
      setLogs(res.data.data.logs);
      setMeta(res.data.meta);
    } catch (e) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <Spinner size="lg" className="text-sky-600 m-8" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">System Audit Trail</h1>
        <p className="text-xs text-slate-500">Immutable ledger of administrative actions and workflow transitions.</p>
      </div>

      <Table headers={['Timestamp', 'Actor', 'Action', 'Entity', 'Details']}>
        {logs.map((log) => (
          <tr key={log._id} className="hover:bg-slate-50 text-xs">
            <td className="px-4 py-3 text-slate-400">
              {new Date(log.createdAt).toLocaleString()}
            </td>
            <td className="px-4 py-3 font-semibold text-slate-800">{log.actor?.name}</td>
            <td className="px-4 py-3 font-mono text-sky-600">{log.action}</td>
            <td className="px-4 py-3 text-slate-600">{log.entityType}</td>
            <td className="px-4 py-3 text-slate-700">{log.message}</td>
          </tr>
        ))}
      </Table>

      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalRecords={meta.totalRecords}
        onPageChange={fetchLogs}
      />
    </div>
  );
}