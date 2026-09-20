/**
 * @file AuthLayout.jsx
 * @description Layout wrapper for public authentication pages (Login, Register).
 */

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  // If already logged in, redirect directly to dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-slate-950 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
};

export default AuthLayout;