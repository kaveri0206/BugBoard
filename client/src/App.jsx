/**
 * @file App.jsx
 * @description Master router registering all authenticated workspace routes.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Core Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import HomePage from './pages/public/HomePage';
import ProfilePage from './pages/profile/ProfilePage';

// Projects
import ProjectListPage from './pages/projects/ProjectListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';

// Issues & Kanban
import IssueListPage from './pages/issues/IssueListPage';
import IssueDetailPage from './pages/issues/IssueDetailPage';
import CreateIssuePage from './pages/issues/CreateIssuePage';
import EditIssuePage from './pages/issues/EditIssuePage';
import KanbanBoardPage from './pages/issues/KanbanBoardPage';

// Telemetry & Admin
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Landing & Authentication */}
              <Route path="/" element={<HomePage />} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Authenticated Workspace */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Projects */}
                  <Route path="/projects" element={<ProjectListPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />

                  {/* Issues */}
                  <Route path="/issues" element={<IssueListPage />} />
                  <Route path="/issues/create" element={<CreateIssuePage />} />
                  <Route path="/issues/:id" element={<IssueDetailPage />} />
                  <Route path="/issues/:id/edit" element={<EditIssuePage />} />

                  {/* Kanban Sprint Board */}
                  <Route path="/kanban" element={<KanbanBoardPage />} />
                  <Route path="/board" element={<KanbanBoardPage />} />

                  {/* Analytics & System Logs */}
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/users" element={<UserManagementPage />} />
                  <Route path="/audit" element={<AuditLogPage />} />
                  <Route path="/audit-logs" element={<AuditLogPage />} />

                  {/* Profile */}
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}