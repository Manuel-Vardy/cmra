'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { IssueReport, IssueCategory, ReportStatus } from '@/lib/types';

const CommunityMapView = dynamic(() => import('../Map/CommunityMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-sm">
      Loading Public Community Map...
    </div>
  ),
});

interface PublicMapPageProps {
  onTrackReport?: (reportNumber: string) => void;
}

export default function PublicMapPage({ onTrackReport }: PublicMapPageProps) {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (res.ok && data.reports) {
        setReports(data.reports);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const totalCount = reports.length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress' || r.status === 'Assigned').length;
  const reviewCount = reports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
      {/* Transparency Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Community Transparency Map
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Shield className="w-3 h-3" />
              Privacy Protected
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Real-time public overview of reported municipal issues, maintenance status, and community resolutions.
          </p>
        </div>

        {/* Public Aggregate Stats (PRD Section 39) */}
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Cases</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Active Units</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{inProgressCount}</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Resolved</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
            </div>
          </div>

          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition"
            title="Refresh map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Markers:</span>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Environment">Environment</option>
            <option value="Utilities">Utilities</option>
            <option value="Safety">Safety & Hazards</option>
            <option value="Public Services">Public Services</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted (New)</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filteredReports.length}</strong> active markers
        </div>
      </div>

      {/* Main Map & Side Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[560px]">
          <CommunityMapView
            reports={filteredReports}
            isPublicMode={true}
            onSelectReport={(rep) => setSelectedReport(rep)}
          />
        </div>

        {/* Selected Report Inspection Box / Highlights */}
        <div className="space-y-4">
          {selectedReport ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {selectedReport.reportNumber}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedReport.status}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {selectedReport.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedReport.description}
              </p>

              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedReport.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Neighborhood:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedReport.location.community}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reported Date:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(selectedReport.reportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedReport.media && selectedReport.media.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                    Public Photo Evidence:
                  </span>
                  <div className="flex gap-2">
                    {selectedReport.media.map((m) => (
                      <img
                        key={m.id}
                        src={m.url}
                        alt="Evidence"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.resolutionEvidence && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolution Completed</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    {selectedReport.resolutionEvidence.notes}
                  </p>
                </div>
              )}

              <button
                onClick={() => onTrackReport && onTrackReport(selectedReport.reportNumber)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-sm"
              >
                Track Case Journey & History
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 mx-auto flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Inspect Any Marker
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any colored pin on the map to inspect issue details, department progress, and resolution evidence.
              </p>
            </div>
          )}

          {/* Quick FAQ / Community Trust */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Civic Transparency Policy
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              In accordance with civic privacy policies (PRD Section 30), resident personal identities, phone numbers, and exact residential unit addresses are strictly omitted from public views.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
