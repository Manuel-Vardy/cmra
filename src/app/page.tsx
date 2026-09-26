'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import UserNavbar, { UserNavTab } from '@/components/UserNavbar';
import UserHomePage from '@/components/Resident/UserHomePage';
import ReportWizard from '@/components/Resident/ReportWizard';
import TrackReportView from '@/components/Resident/TrackReportView';
import PublicMapPage from '@/components/PublicMap/PublicMapPage';
import { IssueCategory } from '@/lib/types';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ResidentPortalPage() {
  const [activeTab, setActiveTab] = useState<UserNavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>('Environment');
  const [trackingReportNumber, setTrackingReportNumber] = useState<string>('CR-2026-004821');

  const handleTrackReport = (reportNumber: string) => {
    setTrackingReportNumber(reportNumber);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromHome = (category: IssueCategory) => {
    setSelectedCategory(category);
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* User Header with the 3 exact nav links + theme toggle */}
      <UserNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: DEDICATED USER HOMEPAGE */}
        {activeTab === 'home' && (
          <UserHomePage
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCategory={handleSelectCategoryFromHome}
          />
        )}

        {/* VIEW 2: REPORT ISSUE */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            {/* Context breadcrumb header */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>

              <span className="text-xs font-semibold text-slate-400">
                Resident Reporting Wizard
              </span>
            </div>

            <ReportWizard
              initialCategory={selectedCategory}
              onTrackReport={handleTrackReport}
              onReportCreated={(rep) => {
                setTrackingReportNumber(rep.reportNumber);
              }}
              onBackToHome={() => setActiveTab('home')}
            />
          </div>
        )}

        {/* VIEW 3: TRACK STATUS */}
        {activeTab === 'track' && (
          <div className="space-y-4">
            {/* Context breadcrumb header */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>

              <span className="text-xs font-semibold text-slate-400">
                Case Tracking & Resolution Journey
              </span>
            </div>

            <TrackReportView initialReportNumber={trackingReportNumber} />
          </div>
        )}

        {/* VIEW 4: PUBLIC MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            {/* Context breadcrumb header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>

              <span className="text-xs font-semibold text-slate-400">
                Community Transparency Map
              </span>
            </div>

            <PublicMapPage onTrackReport={handleTrackReport} />
          </div>
        )}
      </main>

      {/* Resident Site Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">CivicPulse Resident Portal</span>
            <span>• Community Problem Management</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('report')} className="hover:text-blue-600 transition">
              Report Issue
            </button>
            <button onClick={() => setActiveTab('track')} className="hover:text-blue-600 transition">
              Track Status
            </button>
            <button onClick={() => setActiveTab('map')} className="hover:text-blue-600 transition">
              Public Map
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              title="Municipal Staff Access (/admin)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500/70" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
