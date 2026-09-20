import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowRight, 
  LogIn, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2 
} from 'lucide-react';
import Button from '../../components/common/Button';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col justify-between min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navbar — The Single Place for Auth Actions */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center justify-between h-16 max-w-6xl px-6 mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 text-base font-black text-white rounded-lg shadow-md bg-sky-500 shadow-sky-500/30">
              B
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              BugBoard <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">ENTERPRISE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="gap-2 bg-sky-600 hover:bg-sky-500">
                  Workspace ({user?.name?.split(' ')[0]}) <ArrowRight size={14} />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-900 gap-1.5">
                    <LogIn size={14} /> Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="shadow-md bg-sky-600 hover:bg-sky-500 shadow-sky-600/20">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Body: Clean Presentation Without Duplicate Buttons */}
      <main className="flex items-center flex-1 max-w-6xl px-6 py-12 mx-auto">
        <div className="grid items-center w-full grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* Left Column: Core Value Proposition */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border rounded-full border-sky-500/30 bg-sky-500/10 text-sky-400">
              <Sparkles size={13} className="text-sky-300" />
              Gemini AI Assisted Bug Triage
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Enterprise Defect &amp; <br />
              <span className="text-transparent bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text">
                Issue Tracking Platform
              </span>
            </h1>

            <p className="max-w-lg text-xs leading-relaxed sm:text-sm text-slate-400">
              Deterministic state workflow, distinct Developer sprint workstations, QA verification sign-off gates, and automated duplicate detection.
            </p>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-900 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Terminal size={14} className="text-sky-400" />
                <span>Dev Pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>QA Gatekeeper</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-rose-400" />
                <span>Admin Audit</span>
              </div>
            </div>
          </div>

          {/* Right Column: Telemetry Image Card */}
          <div className="relative lg:col-span-6">
            <div className="relative p-2 overflow-hidden border shadow-2xl rounded-2xl border-slate-800 bg-slate-900/60 backdrop-blur-xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live SLA Telemetry
                </span>
                <span className="text-slate-500">v1.0.0 Active</span>
              </div>
              
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
                alt="BugBoard Dashboard Visual"
                className="object-cover w-full h-64 mt-2 border sm:h-72 rounded-xl opacity-90 border-slate-800/60"
              />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-xs text-center border-t border-slate-900 text-slate-500">
        BugBoard &copy; Enterprise Issue Tracker &bull; MERN Stack Architecture
      </footer>
    </div>
  );
}