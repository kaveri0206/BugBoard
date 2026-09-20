import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { analyticsService } from '../../services/analytics.service';
import WorkloadBarChart from '../../components/charts/WorkloadBarChart';
import StatusPieChart from '../../components/charts/StatusPieChart';
import Spinner from '../../components/common/Spinner';

export default function AnalyticsPage() {
  const { data: metrics, loading } = useFetch(analyticsService.getMetrics);

  if (loading) return <Spinner size="lg" className="text-sky-600 m-8" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">System Analytics & Velocity</h1>
        <p className="text-xs text-slate-500">Real-time MongoDB aggregation metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Developer Workload Distribution
          </h3>
          <div className="h-64">
            {metrics?.developerWorkload ? (
              <WorkloadBarChart data={metrics.developerWorkload} />
            ) : (
              <p className="text-xs text-slate-400">No data</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Severity Classification
          </h3>
          <div className="h-64">
            {metrics?.severityDistribution ? (
              <StatusPieChart data={metrics.severityDistribution} />
            ) : (
              <p className="text-xs text-slate-400">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}