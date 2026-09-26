'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  Home,
  Menu,
  X,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export type UserNavTab = 'home' | 'report' | 'track';

interface UserNavbarProps {
  activeTab: UserNavTab;
  setActiveTab: (tab: UserNavTab) => void;
}

export default function UserNavbar({ activeTab, setActiveTab }: UserNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabSelect = (tab: UserNavTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const navItems: { tab: UserNavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { tab: 'report', label: 'Report Issue', icon: <PlusCircle className="w-5 h-5" /> },
    { tab: 'track', label: 'Track Status', icon: <Search className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Platform Name */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => handleTabSelect('home')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                CivicPulse
              </span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map(({ tab, label, icon }) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabSelect(tab)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle — always visible */}
              <ThemeToggle />

              {/* Hamburger button — mobile only */}
              <button
                type="button"
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Menu Panel */}
          <div
            className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navItems.map(({ tab, label, icon }) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabSelect(tab)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-left ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
