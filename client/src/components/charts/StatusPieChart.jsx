import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusPieChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: [
          '#0284c7', // Sky
          '#f59e0b', // Amber
          '#a855f7', // Purple
          '#10b981', // Emerald
          '#64748b', // Slate
          '#f43f5e', // Rose
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />;
}