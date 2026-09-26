'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  UserCheck,
  Bell,
  Sparkles,
  LogOut,
  Loader2,
} from 'lucide-react';
import AdminDashboard from '@/components/Admin/AdminDashboard';
import AdminLogin, { SESSION_KEY } from '@/components/Admin/AdminLogin';
import ThemeToggle from '@/components/ThemeToggle';
import { UserRole } from '@/lib/types';

export default function AdminPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('community_admin');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const isAuth =
      sessionStorage.getItem(SESSION_KEY) === 'true' ||
      localStorage.getItem(SESSION_KEY) === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  // Prevent flash while checking stored session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // If not logged in, render the login gate
  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Dedicated Admin Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Admin Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    CivicPulse
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    Staff Command Center
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Municipal Administration & Dispatch Operations
                </p>
              </div>
            </div>

            {/* Right Tools: Role Switcher, White Mode Toggle, Back to User Site */}
            <div className="flex items-center gap-3">
              {/* Role Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-bold leading-none">Role</span>
                  <select
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                    className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer text-xs"
                  >
                    <option value="community_admin">Community Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="field_officer">Field Officer</option>
                    <option value="moderator">Moderator</option>
                    <option value="viewer">Auditor / Read-Only</option>
                  </select>
                </div>
              </div>

              {/* Theme Toggle (White / Dark mode) */}
              <ThemeToggle />

              {/* Back to Resident Website */}
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs font-bold shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Resident Site</span>
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out of Admin Portal"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition text-xs font-bold shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="flex-1">
        <AdminDashboard currentRole={currentRole} />
      </main>

      {/* Admin Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">CivicPulse Command Center</span>
            <span>• Municipal Field Operations & Incident Dispatch</span>
          </div>
          <div>Authorized Personnel Access Only • Version 1.0</div>
        </div>
      </footer>
    </div>
  );
}
