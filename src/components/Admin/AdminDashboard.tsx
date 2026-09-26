'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Download,
  Building,
  MapPin,
  RefreshCw,
  ExternalLink,
  Layers,
  History,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Flame,
  Radio,
  Database,
  Trash2,
} from 'lucide-react';
import {
  IssueReport,
  AuditLogEntry,
  ReportStatus,
  ReportPriority,
  UserRole,
} from '@/lib/types';
import ReportDetailDrawer from './ReportDetailDrawer';

const CommunityMapView = dynamic(() => import('../Map/CommunityMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-sm">
      Loading Admin Dispatch Map...
    </div>
  ),
});

interface AdminDashboardProps {
  currentRole: UserRole;
}

export default function AdminDashboard({ currentRole }: AdminDashboardProps) {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'table' | 'map' | 'audit'
  const [activeTab, setActiveTab] = useState<'table' | 'map' | 'audit'>('table');

  // Selected report for drawer triage
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [communityFilter, setCommunityFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'critical' | 'unassigned' | 'new' | 'resolved'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, audRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/audit-logs'),
      ]);

      const repData = await repRes.json();
      const audData = await audRes.json();

      if (repRes.ok && repData.reports) setReports(repData.reports);
      if (audRes.ok && audData.auditLogs) setAuditLogs(audData.auditLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateReport = (updated: IssueReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedReport(updated);
    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((d) => d.auditLogs && setAuditLogs(d.auditLogs));
  };

  const [firestoreSyncing, setFirestoreSyncing] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<string | null>(null);

  const handleSyncFirestore = async () => {
    setFirestoreSyncing(true);
    try {
      const res = await fetch('/api/firebase/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFirestoreStatus(data.seedResult?.seeded ? 'Seeded & Synced!' : 'Synced!');
        setTimeout(() => setFirestoreStatus(null), 3500);
        fetchData();
      } else {
        setFirestoreStatus('Check Rules');
        setTimeout(() => setFirestoreStatus(null), 3500);
      }
    } catch {
      setFirestoreStatus('Error');
      setTimeout(() => setFirestoreStatus(null), 3500);
    } finally {
      setFirestoreSyncing(false);
    }
  };

  const handleDeleteReport = async (id: string, reportNumber: string) => {
    if (!confirm(`Are you sure you want to permanently delete report ${reportNumber}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id && r.reportNumber !== id));
        if (selectedReport?.id === id || selectedReport?.reportNumber === id) {
          setSelectedReport(null);
        }
      } else {
        alert('Failed to delete report.');
      }
    } catch {
      alert('Network error while deleting report.');
    }
  };

  const handleClearAllReports = async () => {
    if (!confirm('Are you sure you want to permanently clear ALL reports and reset the database?')) {
      return;
    }
    try {
      const res = await fetch('/api/reports', { method: 'DELETE' });
      if (res.ok) {
        setReports([]);
        setSelectedReport(null);
        alert('All reports cleared successfully.');
      } else {
        alert('Failed to clear reports.');
      }
    } catch {
      alert('Network error while clearing reports.');
    }
  };

  // Export reports to CSV (PRD Section 14)
  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = ['ReportID', 'Title', 'Category', 'Priority', 'Status', 'Community', 'Reporter', 'ReportedAt', 'AssignedDepartment', 'ResolvedAt'];
    const rows = reports.map((r) => [
      r.reportNumber,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.priority,
      r.status,
      `"${r.location.community}"`,
      `"${r.reporter.isAnonymous ? 'Anonymous' : r.reporter.fullName}"`,
      r.reportedAt,
      r.assignment ? `"${r.assignment.department}"` : 'Unassigned',
      r.resolvedAt || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicReports_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered reports logic
  const filteredReports = reports.filter((r) => {
    // Quick filter presets
    if (quickFilter === 'critical' && r.priority !== 'Critical') return false;
    if (quickFilter === 'unassigned' && r.assignment) return false;
    if (quickFilter === 'new' && r.status !== 'Submitted') return false;
    if (quickFilter === 'resolved' && (r.status !== 'Resolved' && r.status !== 'Closed')) return false;

    // Detailed filters
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (communityFilter !== 'all' && r.location.community.toLowerCase() !== communityFilter.toLowerCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = r.reportNumber.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchUser = r.reporter.fullName.toLowerCase().includes(q) || r.reporter.email.toLowerCase().includes(q);
      const matchAddr = r.location.address.toLowerCase().includes(q);
      const matchOfficer = r.assignment?.officerName?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchDesc && !matchUser && !matchAddr && !matchOfficer) {
        return false;
      }
    }
    return true;
  });

  // KPI calculations
  const totalCount = reports.length;
  const newCount = reports.filter((r) => r.status === 'Submitted').length;
  const underReviewCount = reports.filter((r) => r.status === 'Under Review' || r.status === 'Verified').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress' || r.status === 'Assigned').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
  const criticalCount = reports.filter((r) => r.priority === 'Critical').length;

  const nowMs = Date.now();
  const overdueCount = reports.filter((r) => {
    if (r.status === 'Resolved' || r.status === 'Closed') return false;
    const diffHours = (nowMs - new Date(r.reportedAt).getTime()) / (3600 * 1000);
    return diffHours > r.slaTargetHours;
  }).length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Administrator Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {currentRole.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Centralized triage, SLA dispatch, field assignments, and verified resolution evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync to Firestore */}
          <button
            onClick={handleSyncFirestore}
            disabled={firestoreSyncing}
            title="Sync reports and audit logs with Firebase Firestore"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-sm disabled:opacity-60"
          >
            <Database className={`w-3.5 h-3.5 ${firestoreSyncing ? 'animate-spin' : ''}`} />
            <span>{firestoreSyncing ? 'Syncing...' : firestoreStatus || 'Sync to Firestore'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export CSV
          </button>
          <button
            onClick={handleClearAllReports}
            title="Permanently remove all reports and start fresh"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All Reports
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* SLA Alert Banner if Overdue or Critical issues exist */}
      {(overdueCount > 0 || criticalCount > 0) && (
        <div className="p-4 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-200 dark:border-red-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-sm text-red-900 dark:text-red-300">
                Action Required: {criticalCount} Critical Case{criticalCount > 1 ? 's' : ''} & {overdueCount} Overdue Report{overdueCount > 1 ? 's' : ''}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Critical SLA targets require 1-hour response. Please prioritize dispatch for hazardous reports.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setQuickFilter('critical');
              setActiveTab('table');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap"
          >
            Filter Critical Cases
          </button>
        </div>
      )}

      {/* KPI Cards (PRD Section 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Reports</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount}</div>
          <span className="text-[10px] text-slate-400">All submissions</span>
        </div>

        {/* New / Submitted */}
        <div
          onClick={() => setQuickFilter('new')}
          className={`cursor-pointer p-4 rounded-2xl border shadow-sm transition ${
            quickFilter === 'new'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase block">New Submissions</span>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">{newCount}</div>
          <span className="text-[10px] text-slate-400">Needs review</span>
        </div>

        {/* Under Review */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-amber-500 uppercase block">Under Review</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{underReviewCount}</div>
          <span className="text-[10px] text-slate-400">Verification in progress</span>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-indigo-500 uppercase block">In Progress</span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{inProgressCount}</div>
          <span className="text-[10px] text-slate-400">Assigned field units</span>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setQuickFilter('resolved')}
          className={`cursor-pointer p-4 rounded-2xl border shadow-sm transition ${
            quickFilter === 'resolved'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Resolved Cases</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</div>
          <span className="text-[10px] text-slate-400">Signed off</span>
        </div>

        {/* Critical */}
        <div
          onClick={() => setQuickFilter(quickFilter === 'critical' ? 'all' : 'critical')}
          className={`cursor-pointer p-4 rounded-2xl border shadow-sm transition ${
            quickFilter === 'critical'
              ? 'bg-red-50 dark:bg-red-950/40 border-red-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase block flex items-center justify-between">
            Critical
            {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </span>
          <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{criticalCount}</div>
          <span className="text-[10px] text-slate-400">Safety hazards</span>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-rose-500 uppercase block">SLA Overdue</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{overdueCount}</div>
          <span className="text-[10px] text-slate-400">Target exceeded</span>
        </div>
      </div>

      {/* View Switcher Tabs: Table vs Map vs Audit Log */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'table'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Report Management Table
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'map'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Admin Dispatch Map
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: Report Management Table (PRD Section 14) */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Report ID, title, citizen, street, or officer..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold">Quick View:</span>
                <button
                  type="button"
                  onClick={() => setQuickFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                    quickFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All ({reports.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('unassigned')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                    quickFilter === 'unassigned'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Needs Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('critical')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                    quickFilter === 'critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                  }`}
                >
                  Critical Only
                </button>
              </div>
            </div>

            {/* Granular Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Categories</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Environment">Environment</option>
                <option value="Utilities">Utilities</option>
                <option value="Safety">Safety</option>
                <option value="Public Services">Public Services</option>
              </select>

              <select
                value={communityFilter}
                onChange={(e) => setCommunityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Communities</option>
                <option value="Downtown Central">Downtown Central</option>
                <option value="Oakridge Heights">Oakridge Heights</option>
                <option value="Pine Grove">Pine Grove</option>
                <option value="Harborview">Harborview</option>
              </select>

              <div className="ml-auto text-slate-400 text-xs">
                Showing <strong>{filteredReports.length}</strong> cases
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Report ID</th>
                    <th className="py-3.5 px-4">Issue & Location</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority / SLA</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned Department</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => {
                      const isOverdue =
                        report.status !== 'Resolved' &&
                        report.status !== 'Closed' &&
                        (nowMs - new Date(report.reportedAt).getTime()) / (3600 * 1000) >
                          report.slaTargetHours;

                      return (
                        <tr
                          key={report.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                          onClick={() => setSelectedReport(report)}
                        >
                          {/* ID */}
                          <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {report.reportNumber}
                          </td>

                          {/* Title & Location */}
                          <td className="py-4 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {report.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{report.location.address}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {report.category}
                          </td>

                          {/* Priority */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                                report.priority === 'Critical'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                  : report.priority === 'High'
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              }`}
                            >
                              {report.priority}
                            </span>
                            {isOverdue && (
                              <span className="ml-1 text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                                SLA OVERDUE
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                                report.status === 'Resolved' || report.status === 'Closed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : report.status === 'In Progress'
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                  : report.status === 'Assigned'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>

                          {/* Assigned Department */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {report.assignment ? (
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {report.assignment.department}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {report.assignment.officerName}
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold italic">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReport(report);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 rounded-lg font-bold text-xs transition"
                              >
                                Triage Case
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReport(report.id, report.reportNumber);
                                }}
                                title="Delete Report"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No reports matching your search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Admin Dispatch Map (PRD Section 23) */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Click any pin on the dispatch map to open instant case triage and assignment drawer.
            </span>
            <span>
              Total pins rendered: <strong>{filteredReports.length}</strong>
            </span>
          </div>

          <div className="h-[600px]">
            <CommunityMapView
              reports={filteredReports}
              isPublicMode={false}
              onSelectReport={(rep) => setSelectedReport(rep)}
            />
          </div>
        </div>
      )}

      {/* TAB 3: System Audit Trail (PRD Section 32) */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              System Audit & Compliance Log
            </h3>
            <p className="text-xs text-slate-500">
              Immutable chronological record of administrative actions, state transitions, assignments, and resolution uploads.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((entry) => (
              <div key={entry.id} className="py-3 flex items-start gap-4 text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  {entry.action.slice(0, 3)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {entry.details}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>
                      Actor: <strong>{entry.actor}</strong> ({entry.role})
                    </span>
                    {entry.reportNumber && (
                      <span className="font-mono text-blue-600 dark:text-blue-400">
                        {entry.reportNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triage & Detail Drawer */}
      {selectedReport && (
        <ReportDetailDrawer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={handleUpdateReport}
          onDelete={handleDeleteReport}
          currentRole={currentRole}
          currentUserName="Elena Gomez (Admin)"
        />
      )}
    </div>
  );
}
