'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  PieChart,
  Users,
  Building,
  Target,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  total: number;
  newReports: number;
  underReview: number;
  verified: number;
  inProgress: number;
  resolved: number;
  critical: number;
  overdue: number;
  avgResolutionHours: number;
  slaAdherenceRate: number;
  resolutionRate: number;
  categories: Record<string, number>;
  priorities: Record<string, number>;
}

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Aggregating municipal resolution intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Municipal Operational Analytics & SLA
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Performance metrics, response benchmarks, category distribution, and SLA resolution compliance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition shadow-sm w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          Refresh Metrics
        </button>
      </div>

      {/* Top 4 Key Metric Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SLA Adherence */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">SLA Adherence Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.slaAdherenceRate}%
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Target &gt; 90% met
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg Resolution Time</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.avgResolutionHours} <span className="text-lg font-normal text-slate-400">hours</span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">
            Industry Benchmark: 6.0h
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Resolution Ratio</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.resolutionRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {data.resolved} of {data.total} reports completed
          </div>
        </div>

        {/* Overdue / Escalations */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Overdue Cases</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {data.overdue}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {data.critical} hazardous critical issues
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Reports by Community Issue Category
            </h3>
            <span className="text-xs text-slate-400">Total: {data.total}</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(data.categories).map(([category, count]) => {
              const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{category}</span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority SLA Target Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              Priority Distribution & Response SLAs
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Critical</span>
                <span className="text-lg font-extrabold text-red-700 dark:text-red-300">
                  {data.priorities.Critical || 0}
                </span>
              </div>
              <div className="text-[11px] text-red-600/80 mt-1">SLA Target: 1 Hour Response</div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-200 dark:border-orange-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase">High</span>
                <span className="text-lg font-extrabold text-orange-700 dark:text-orange-300">
                  {data.priorities.High || 0}
                </span>
              </div>
              <div className="text-[11px] text-orange-600/80 mt-1">SLA Target: 6 Hours</div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">Medium</span>
                <span className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                  {data.priorities.Medium || 0}
                </span>
              </div>
              <div className="text-[11px] text-amber-600/80 mt-1">SLA Target: 24 Hours</div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Low</span>
                <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                  {data.priorities.Low || 0}
                </span>
              </div>
              <div className="text-[11px] text-blue-600/80 mt-1">SLA Target: 72 Hours (3 Days)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
