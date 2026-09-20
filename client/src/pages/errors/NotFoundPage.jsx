import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-black text-slate-300">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2 mb-1">Resource Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested URL does not point to an active issue, project, or dashboard view.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
}