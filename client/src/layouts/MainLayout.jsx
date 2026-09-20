/**
 * @file MainLayout.jsx
 * @description Primary application shell for authenticated users.
 * Houses the top navigation bar, sidebar navigation, and page outlet.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Collapsible/Static Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto md:p-6 bg-slate-900/50">
          <div className="w-full mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;