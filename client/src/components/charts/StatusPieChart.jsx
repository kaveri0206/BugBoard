/**
 * @file StatusPieChart.jsx
 * @description Defect Severity / Status distribution pie/doughnut chart supporting raw array and Chart.js formats.
 */

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DEFAULT_COLORS = ['#38BDF8', '#FBBF24', '#FB923C', '#F87171', '#A855F7', '#34D399'];

export default function StatusPieChart({ data }) {
  let chartData;

  if (Array.isArray(data)) {
    chartData = {
      labels: data.map((item) => item._id || item.label || item.status || item.severity || 'Unknown'),
      datasets: [
        {
          label: 'Defects',
          data: data.map((item) => item.count ?? item.value ?? 0),
          backgroundColor: DEFAULT_COLORS.slice(0, Math.max(data.length, 4)),
          borderColor: '#0F172A',
          borderWidth: 2,
        },
      ],
    };
  } else if (data && typeof data === 'object' && Array.isArray(data.labels)) {
    chartData = data;
  } else {
    chartData = {
      labels: ['Low', 'Medium', 'High', 'Critical'],
      datasets: [
        {
          label: 'Defect Severity',
          data: [5, 8, 5, 3],
          backgroundColor: ['#38BDF8', '#FBBF24', '#FB923C', '#F87171'],
          borderColor: '#0F172A',
          borderWidth: 2,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94A3B8',
          font: { size: 11 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#38BDF8',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}