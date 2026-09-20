/**
 * @file WorkloadBarChart.jsx
 * @description Developer Workload distribution chart supporting both raw array and pre-formatted Chart.js inputs.
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WorkloadBarChart({ data }) {
  // Normalize input data
  let chartData;

  if (Array.isArray(data)) {
    chartData = {
      labels: data.map((item) => item.name || item.developer || item.label || 'Dev'),
      datasets: [
        {
          label: 'Assigned Tickets',
          data: data.map((item) => item.count ?? item.tickets ?? item.value ?? 0),
          backgroundColor: '#38BDF8',
          borderColor: '#0284C7',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  } else if (data && typeof data === 'object' && Array.isArray(data.labels)) {
    chartData = data;
  } else {
    chartData = {
      labels: ['Senior Developer', 'Frontend Dev', 'QA Lead'],
      datasets: [
        {
          label: 'Assigned Tickets',
          data: [12, 6, 3],
          backgroundColor: '#38BDF8',
          borderColor: '#0284C7',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#38BDF8',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: '#1E293B', drawBorder: false },
        ticks: { color: '#94A3B8', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#1E293B', drawBorder: false },
        ticks: { color: '#94A3B8', font: { size: 11 }, precision: 0 },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}