'use client';

import React from 'react';
import {
  Camera,
  FileText,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Trees,
  Droplets,
  Zap,
  HardHat,
  Search,
  PlusCircle,
  Map,
  Clock,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import { IssueCategory } from '@/lib/types';

interface UserHomePageProps {
  onNavigateTab: (tab: 'home' | 'report' | 'track' | 'map') => void;
  onSelectCategory?: (category: IssueCategory) => void;
}

const CATEGORY_SHORTCUTS: {
  id: IssueCategory;
  title: string;
  desc: string;
  icon: any;
  color: string;
  badge: string;
}[] = [
  {
    id: 'Infrastructure',
    title: 'Roads & Pavement',
    desc: 'Potholes, broken asphalt, damaged curbs, cracked sidewalks',
    icon: Building2,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Avg 24h SLA',
  },
  {
    id: 'Environment',
    title: 'Drainage & Flooding',
    desc: 'Blocked gutters, standing flood water, open culverts',
    icon: Trees,
    color: 'from-emerald-500 to-teal-600',
    badge: 'High Priority',
  },
  {
    id: 'Utilities',
    title: 'Streetlights & Water',
    desc: 'Dark light poles, burst water mains, low water pressure',
    icon: Droplets,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Utility Dispatch',
  },
  {
    id: 'Safety',
    title: 'Hazardous Cables & Wires',
    desc: 'Downed power limbs, exposed wires, structural danger',
    icon: Zap,
    color: 'from-amber-500 to-red-600',
    badge: 'Critical 1h SLA',
  },
  {
    id: 'Environment',
    title: 'Garbage & Dumping',
    desc: 'Illegal trash piles, uncollected bins, litter overflow',
    icon: HardHat,
    color: 'from-purple-500 to-indigo-600',
    badge: 'Sanitation Unit',
  },
  {
    id: 'Public Services',
    title: 'Parks & School Zones',
    desc: 'Playground equipment damage, crosswalk visibility',
    icon: ShieldCheck,
    color: 'from-slate-600 to-slate-800',
    badge: 'Public Care',
  },
];

export default function UserHomePage({ onNavigateTab, onSelectCategory }: UserHomePageProps) {
  return (
    <div className="space-y-16 py-8 animate-fadeIn">
      {/* Hero Section (PRD Section 51) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-slate-900/60 dark:via-slate-900/20 dark:to-transparent rounded-3xl p-6 sm:p-12 border border-slate-200/80 dark:border-slate-800 max-w-7xl mx-auto shadow-sm">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Civic Community Management & Resolution
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            See a Problem?{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Report It.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Help make your community safer, cleaner, and better by reporting neighborhood problems directly to your local public works and municipal teams.
          </p>

          {/* 3 Main Action Tiles directly mapping to the 3 Navs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
            {/* Tile 1: Report Issue */}
            <div
              onClick={() => onNavigateTab('report')}
              className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-blue-500/20 hover:border-blue-600 dark:border-slate-800 dark:hover:border-blue-500 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-blue-600/30 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Report Issue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Snap a photo, pinpoint location on map, and dispatch immediately to city staff.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Start Report</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 2: Track Status */}
            <div
              onClick={() => onNavigateTab('track')}
              className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Track Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Look up your case with Report ID to view field unit progress and after-photos.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Check Case Progress</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tile 3: Public Map */}
            <div
              onClick={() => onNavigateTab('map')}
              className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  Public Map
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Browse community map with privacy protection to see neighborhood maintenance.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>View Community Map</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" 4 Steps (PRD Section 51) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Simple 1–2 Minute Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How It Works: Capture → Describe → Locate → Resolve
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Our platform connects residents directly with accountable municipal departments with live evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-extrabold text-sm mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono font-bold text-blue-600 mb-1">STEP 01</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Capture Evidence</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Take a quick photo or short video on your smartphone highlighting the damage or hazard.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-extrabold text-sm mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono font-bold text-indigo-600 mb-1">STEP 02</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Describe Problem</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Pick the issue category, describe what occurred, and indicate urgency level.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center font-extrabold text-sm mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono font-bold text-cyan-600 mb-1">STEP 03</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Pinpoint Location</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Use automatic device GPS or drag the pin on our interactive OpenStreetMap to the exact spot.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-extrabold text-sm mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono font-bold text-emerald-600 mb-1">STEP 04</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Track & Resolve</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Receive your unique tracking code, follow field officer dispatch, and verify after-photos.
            </p>
          </div>
        </div>
      </section>

      {/* Category Fast-Track Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              What Problem Are You Experiencing?
            </h2>
            <p className="text-xs text-slate-500">
              Select any category below to immediately start a pre-categorized report.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('report')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline w-fit"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_SHORTCUTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(item.id);
                  onNavigateTab('report');
                }}
                className="group cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all flex items-start gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Community Pulse & Resolved Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-200">
              Community Accountability In Action
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Over 89% of reported community issues resolved within target SLA
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              From unblocking high-volume market drainages to repairing exposed wires, civic departments are responding faster and publishing verifiable resolution proof.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('map')}
              className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition shadow-sm"
            >
              Explore Public Map
            </button>
            <button
              onClick={() => onNavigateTab('report')}
              className="px-5 py-3 rounded-2xl bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-xs border border-white/20 transition"
            >
              Submit an Issue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
