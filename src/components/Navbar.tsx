'use client';

import React from 'react';
import {
  ShieldAlert,
  Search,
  PlusCircle,
  Map,
  BarChart3,
  UserCheck,
  Bell,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface NavbarProps {
  activeTab: 'report' | 'track' | 'map' | 'admin' | 'analytics';
  setActiveTab: (tab: 'report' | 'track' | 'map' | 'admin' | 'analytics') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  unreadCount?: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  unreadCount = 2,
}: NavbarProps) {
  const roleNames: Record<UserRole, string> = {
    resident: 'Citizen / Resident',
    community_admin: 'Community Admin',
    super_admin: 'Super Admin',
    field_officer: 'Field Officer',
    moderator: 'Moderator',
    viewer: 'Auditor / Viewer',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Positioning */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('report')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              CivicPulse
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'report'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Report Issue
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'track'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              Track Status
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Map className="w-4 h-4" />
              Public Map
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Center
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </nav>

          {/* Right Section: Role Simulator & Notification Preview */}
          <div className="flex items-center gap-3">
            {/* Live Role Switcher dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold leading-none">Role</span>
                <select
                  value={currentRole}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setCurrentRole(newRole);
                    if (newRole !== 'resident' && activeTab === 'report') {
                      setActiveTab('admin');
                    }
                  }}
                  className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer text-xs"
                >
                  <option value="resident">Resident / Citizen</option>
                  <option value="community_admin">Community Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="field_officer">Field Officer</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </div>

            {/* Quick alert badge */}
            <div className="relative cursor-pointer p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile bottom navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'report' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Report
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'track' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Search className="w-4 h-4" />
            Track
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'map' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Map className="w-4 h-4" />
            Map
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'admin' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Stats
          </button>
        </div>
      </div>
    </header>
  );
}
