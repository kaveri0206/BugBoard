/**
 * @file LoginPage.jsx
 * @description Enterprise authentication interface for BugBoard.
 * Features credential inputs, quick-fill demo cards for all 3 RBAC tiers,
 * and role-based redirect routing.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Helper: Resolves the dedicated landing page based on RBAC role
   */
  const getRoleLandingRoute = (role) => {
    switch (role) {
      case 'Admin':
        return '/dashboard';
      case 'Developer':
        return '/projects';
      case 'Tester':
        return '/issues';
      default:
        return '/dashboard';
    }
  };

  /**
   * Auto-fills credentials for evaluation testing
   */
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  /**
   * Authentication Form Submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      toastSuccess?.(`Welcome back, ${user.name || 'Engineer'}!`);

      // 1. Honor redirect intent if user was kicked to /login from a specific URL
      const returnUrl = location.state?.from?.pathname;
      if (returnUrl && returnUrl !== '/login' && returnUrl !== '/') {
        navigate(returnUrl, { replace: true });
        return;
      }

      // 2. Otherwise, route directly to the role-specific workspace
      const targetRoute = getRoleLandingRoute(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials.';
      setErrorMessage(msg);
      toastError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-slate-950 selection:bg-sky-500 selection:text-slate-900">
      {/* Background Glow */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none top-1/4 left-1/2 w-96 h-96 bg-sky-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-3 border shadow-lg rounded-xl bg-sky-500/10 border-sky-500/20 text-sky-400 shadow-sky-500/5">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            BugBoard <span className="text-sky-400">Enterprise</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access your defect management workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 border shadow-2xl bg-slate-900/90 border-slate-800 backdrop-blur-xl rounded-2xl sm:p-8 shadow-black/60">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 mb-5 text-xs border rounded-lg bg-rose-500/10 border-rose-500/30 text-rose-400">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bugboard.dev"
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-150"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium tracking-wider uppercase text-slate-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 mt-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full border-slate-950 border-t-transparent animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick-Fill Evaluator Shortcuts */}
          <div className="pt-5 mt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Click to Auto-Fill Role:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickFill('admin@bugboard.dev', 'Password123!')
                }
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] font-medium text-sky-300 rounded-md transition-all text-center truncate"
              >
                Admin UI
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill('developer@bugboard.dev', 'Password123!')
                }
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] font-medium text-emerald-300 rounded-md transition-all text-center truncate"
              >
                Developer UI
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill('tester@bugboard.dev', 'Password123!')
                }
                className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] font-medium text-amber-300 rounded-md transition-all text-center truncate"
              >
                QA / Tester UI
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-4 text-xs text-center text-slate-500">
          Need a separate account?{' '}
          <Link
            to="/register"
            className="transition-colors text-sky-400 hover:text-sky-300"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;