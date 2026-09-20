import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FolderGit2,
  Bug,
  Kanban,
  BarChart3,
  Users,
  ShieldCheck,
  UserCircle,
  CheckSquare,
  PlusCircle,
  Briefcase
} from 'lucide-react';
import { ROLES } from '../../config/constants';

export default function Sidebar() {
  const { user } = useAuth();

  // Core navigation for all logged-in members
  const standardLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Issue Registry', path: '/issues', icon: Bug },
    { name: 'Kanban Board', path: '/kanban', icon: Kanban },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  // Specific role links
  const devLinks = [
    { name: 'My Active Tasks', path: `/issues?assignee=${user?._id || ''}`, icon: Briefcase },
  ];

  const testerLinks = [
    { name: 'QA Verify Queue', path: '/issues?status=Testing', icon: CheckSquare },
    { name: 'Report Bug', path: '/issues/create', icon: PlusCircle },
  ];

  const adminLinks = [
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Audit & Security Log', path: '/admin/audit', icon: ShieldCheck },
  ];

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-slate-300 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 text-base font-bold text-white rounded-lg shadow-sm bg-sky-500">
            B
          </div>
          <span className="text-base font-bold tracking-wide text-white">BugBoard</span>
        </div>
        <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-semibold border ${
          user?.role === ROLES.ADMIN ? 'bg-rose-950 text-rose-300 border-rose-800' :
          user?.role === ROLES.DEVELOPER ? 'bg-sky-950 text-sky-300 border-sky-800' :
          'bg-emerald-950 text-emerald-300 border-emerald-800'
        }`}>
          {user?.role}
        </span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            General
          </span>
          <div className="space-y-1">
            {standardLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon size={16} />
                  {link.name}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Role Custom Navigation Workspaces */}
        {user?.role === ROLES.DEVELOPER && (
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-2">
              Developer Scope
            </span>
            <div className="space-y-1">
              {devLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {link.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {user?.role === ROLES.TESTER && (
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              QA Workbench
            </span>
            <div className="space-y-1">
              {testerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {link.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {user?.role === ROLES.ADMIN && (
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-2">
              Administration
            </span>
            <div className="space-y-1">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {link.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Account
          </span>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <UserCircle size={16} />
            My Profile & Security
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>v1.0.0 Enterprise</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="API Online"></span>
      </div>
    </aside>
  );
}