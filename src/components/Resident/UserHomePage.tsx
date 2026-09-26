'use client';

import React from 'react';
import Image from 'next/image';
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
  onNavigateTab: (tab: 'home' | 'report' | 'track') => void;
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
    <div className="space-y-16 pb-8 animate-fadeIn">
      {/* Hero Section (Full Width with Cityscape Background & Soft Dark Overlay) */}
      <section className="relative w-full -mt-8 min-h-[580px] sm:min-h-[680px] pt-32 sm:pt-44 pb-36 sm:pb-48 px-4 sm:px-6 lg:px-8 flex flex-col justify-center border-b border-slate-200/20">
        {/* Background Image: cityscape-wuxi.jpg */}
        <Image
          src="/cityscape-wuxi.jpg"
          alt="Cityscape Background"
          fill
          priority
          className="object-cover object-center pointer-events-none"
        />

        {/* Reduced / Lighter Dark Overlay */}
        <div className="absolute inset-0 bg-slate-950/35 dark:bg-slate-950/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-slate-950/15 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            See a Problem?{' '}
            <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
              Report It.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Help make your community safer, cleaner, and better by reporting neighborhood problems directly to your local public works and municipal teams.
          </p>
        </div>
      </section>

      {/* 2 Main Action Tiles Overlapping Bottom Tip of Hero Section */}
      <div className="relative z-20 -mt-24 sm:-mt-32 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Report Issue */}
          <div
            onClick={() => onNavigateTab('report')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Report Issue
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Snap a photo, pinpoint location on map, and dispatch immediately to city staff.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Start Report</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 2: Track Status */}
          <div
            onClick={() => onNavigateTab('track')}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Track Status
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Look up your case with Report ID to view field unit progress and after-photos.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Check Case Progress</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* "How It Works" 4 Steps (PRD Section 51) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-4 max-w-4xl mx-auto w-full">
          {/* Card 1: Capture Evidence */}
          <div className="relative flex flex-col">
            <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src="/capture.jpg"
                alt="Capture Evidence"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative -mt-10 mx-4 sm:mx-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 pt-0 z-10 flex-1 flex flex-col justify-start">
              <div className="inline-block bg-[#0f2147] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 -mt-3.5 w-fit">
                STEP 01
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 leading-snug">
                1. Capture Evidence
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Take a quick photo or short video on your smartphone highlighting the damage or hazard.
              </p>
            </div>
          </div>

          {/* Card 2: Describe Problem */}
          <div className="relative flex flex-col">
            <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src="/describe.jpg"
                alt="Describe Problem"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative -mt-10 mx-4 sm:mx-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 pt-0 z-10 flex-1 flex flex-col justify-start">
              <div className="inline-block bg-[#0f2147] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 -mt-3.5 w-fit">
                STEP 02
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 leading-snug">
                2. Describe Problem
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Pick the issue category, describe what occurred, and indicate urgency level.
              </p>
            </div>
          </div>

          {/* Card 3: Pinpoint Location */}
          <div className="relative flex flex-col">
            <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src="/location.jpg"
                alt="Pinpoint Location"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative -mt-10 mx-4 sm:mx-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 pt-0 z-10 flex-1 flex flex-col justify-start">
              <div className="inline-block bg-[#0f2147] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 -mt-3.5 w-fit">
                STEP 03
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 leading-snug">
                3. Pinpoint Location
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Use automatic device GPS or drag the pin on our interactive OpenStreetMap to the exact spot.
              </p>
            </div>
          </div>

          {/* Card 4: Track & Resolve */}
          <div className="relative flex flex-col">
            <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src="/track.jpg"
                alt="Track & Resolve"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative -mt-10 mx-4 sm:mx-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 pt-0 z-10 flex-1 flex flex-col justify-start">
              <div className="inline-block bg-[#0f2147] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 -mt-3.5 w-fit">
                STEP 04
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3 leading-snug">
                4. Track & Resolve
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Receive your unique tracking code, follow field officer dispatch, and verify after-photos.
              </p>
            </div>
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
            return (
              <div
                key={idx}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(item.id);
                  onNavigateTab('report');
                }}
                className="group cursor-pointer bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 transition-all flex flex-col justify-start"
              >
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Community Pulse & Resolved Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden p-8 sm:p-12 text-white border border-slate-200/20 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Background Image: bottom-image.jpg */}
          <Image
            src="/bottom-image.jpg"
            alt="Community Accountability Background"
            fill
            className="object-cover object-center pointer-events-none"
          />

          {/* Dark / Blue Overlay */}
          <div className="absolute inset-0 bg-blue-950/80 dark:bg-slate-950/85 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-950/75 to-slate-950/80 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-300">
              Community Accountability In Action
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Over 89% of reported community issues resolved within target SLA
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              From unblocking high-volume market drainages to repairing exposed wires, civic departments are responding faster and publishing verifiable resolution proof.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('track')}
              className="px-6 py-3 bg-white text-blue-900 font-bold text-xs hover:bg-slate-100 transition shadow-sm"
            >
              Track Status
            </button>
            <button
              onClick={() => onNavigateTab('report')}
              className="px-6 py-3 bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs border border-white/20 transition backdrop-blur-sm"
            >
              Submit an Issue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
