import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import DashboardPage from '../pages/dashboard/DashboardPage';
import ProjectListPage from '../pages/projects/ProjectListPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import IssueListPage from '../pages/issues/IssueListPage';
import IssueDetailPage from '../pages/issues/IssueDetailPage';
import CreateIssuePage from '../pages/issues/CreateIssuePage';
import EditIssuePage from '../pages/issues/EditIssuePage';
import KanbanPage from '../pages/kanban/KanbanPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import ProfilePage from '../pages/profile/ProfilePage';

import UserManagementPage from '../pages/admin/UserManagementPage';
import AuditLogPage from '../pages/admin/AuditLogPage';

import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import { ROLES } from '../config/constants';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Home Landing Page (Must be top-level, standalone) */}
      <Route path="/" element={<HomePage />} />

      {/* 2. Public Auth Screens */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* 3. Protected Team Workspace */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/issues" element={<IssueListPage />} />
          <Route path="/issues/create" element={<CreateIssuePage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Restricted */}
          <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/audit" element={<AuditLogPage />} />
          </Route>

          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}