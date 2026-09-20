import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import DeveloperDashboard from '../../components/dashboard/DeveloperDashboard';
import TesterDashboard from '../../components/dashboard/TesterDashboard';
import Spinner from '../../components/common/Spinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-sky-600" />
      </div>
    );
  }

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard user={user} />;
    case 'Developer':
      return <DeveloperDashboard user={user} />;
    case 'Tester':
      return <TesterDashboard user={user} />;
    default:
      return <DeveloperDashboard user={user} />;
  }
}