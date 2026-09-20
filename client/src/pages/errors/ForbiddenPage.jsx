import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-black text-rose-300">403</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2 mb-1">Access Forbidden</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        Your assigned role lacks clearance to view or modify this administrative endpoint.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
}