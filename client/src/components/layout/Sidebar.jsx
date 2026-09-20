/**
 * @file Sidebar.jsx
 * @description Sidebar navigation reflecting system roles and workspace views.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/5'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <aside className="flex flex-col justify-between w-64 p-4 border-r select-none bg-slate-950 border-slate-800/80 shrink-0">
      <div className="space-y-6">
        {/* Brand Banner */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-black rounded-lg shadow-md bg-sky-500 text-slate-950 shadow-sky-500/30">
              B
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              BugBoard
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
            {user?.role || 'User'}
          </span>
        </div>

        {/* General Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            General
          </p>
          <NavLink to="/dashboard" className={navItemClass}>
            <span className="text-base">⊞</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={navItemClass}>
            <span className="text-base">📁</span>
            <span>Projects</span>
          </NavLink>
          <NavLink to="/issues" className={navItemClass}>
            <span className="text-base">🐞</span>
            <span>Issue Registry</span>
          </NavLink>
          <NavLink to="/kanban" className={navItemClass}>
            <span className="text-base">▥</span>
            <span>Kanban Board</span>
          </NavLink>
          <NavLink to="/analytics" className={navItemClass}>
            <span className="text-base">📊</span>
            <span>Analytics</span>
          </NavLink>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Administration
            </p>
            <NavLink to="/users" className={navItemClass}>
              <span className="text-base">👥</span>
              <span>User Management</span>
            </NavLink>
            <NavLink to="/audit" className={navItemClass}>
              <span className="text-base">🛡️</span>
              <span>Audit & Security Log</span>
            </NavLink>
          </div>
        )}

        {/* Account Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Account
          </p>
          <NavLink to="/profile" className={navItemClass}>
            <span className="text-base">⚙️</span>
            <span>My Profile & Security</span>
          </NavLink>
        </div>
      </div>

      {/* Footer Profile Mini-card */}
      <div className="flex items-center justify-between p-3 border bg-slate-900/60 border-slate-800/80 rounded-xl">
        <div className="truncate">
          <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;