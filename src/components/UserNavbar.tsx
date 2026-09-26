'use client';

import React from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  Map,
  Home,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export type UserNavTab = 'home' | 'report' | 'track' | 'map';

interface UserNavbarProps {
  activeTab: UserNavTab;
  setActiveTab: (tab: UserNavTab) => void;
}

export default function UserNavbar({ activeTab, setActiveTab }: UserNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  CivicPulse
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  Resident Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Report → Respond → Resolve
              </p>
            </div>
          </div>

          {/* 3 Nav Links requested by user: Report Issue, Track Status, Public Map (plus Home) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>

            {/* Exactly as user screenshot: ⊕ Report Issue */}
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'report'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-500 group-hover:text-white" />
              <span>Report Issue</span>
            </button>

            {/* Exactly as user screenshot: 🔍 Track Status */}
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-blue-500" />
              <span>Track Status</span>
            </button>

            {/* Exactly as user screenshot: 🗺️ Public Map */}
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Map className="w-4 h-4 text-blue-500" />
              <span>Public Map</span>
            </button>
          </nav>

          {/* Right Section: Theme Toggle (White mode / Dark mode) */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              activeTab === 'home' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              activeTab === 'report' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report</span>
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              activeTab === 'track' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-0.5 font-semibold ${
              activeTab === 'map' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Map</span>
          </button>
        </div>
      </div>
    </header>
  );
}
