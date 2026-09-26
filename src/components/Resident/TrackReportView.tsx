'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Send,
  Star,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  FileSearch,
} from 'lucide-react';
import { IssueReport, ReportStatus } from '@/lib/types';

interface TrackReportViewProps {
  initialReportNumber?: string;
}

const LIFECYCLE_STEPS: ReportStatus[] = [
  'Submitted',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export default function TrackReportView({ initialReportNumber = '' }: TrackReportViewProps) {
  const [searchId, setSearchId] = useState(initialReportNumber);
  const [report, setReport] = useState<IssueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Feedback form state
  const [feedbackSatisfied, setFeedbackSatisfied] = useState<boolean>(true);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchReport = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setFeedbackSuccess(false);

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(id.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Report not found. Please check your tracking number.');
      }

      setReport(data.report);
      if (data.report.feedback) {
        setFeedbackSatisfied(data.report.feedback.satisfied);
        setFeedbackRating(data.report.feedback.rating);
        setFeedbackComments(data.report.feedback.comments);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to fetch report details.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReportNumber) {
      setSearchId(initialReportNumber);
      fetchReport(initialReportNumber);
    }
  }, [initialReportNumber]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          satisfied: feedbackSatisfied,
          rating: feedbackRating,
          comments: feedbackComments,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      setFeedbackSuccess(true);
      setReport({ ...report, feedback: data.feedback });
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const currentStepIndex = report ? LIFECYCLE_STEPS.indexOf(report.status) : -1;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn">
      {/* Header & Search */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Your Community Report
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Enter your unique Report ID to inspect real-time progress, dispatch status, and field resolution evidence.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchReport(searchId);
            }}
            className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md focus-within:ring-2 focus-within:ring-blue-500"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. CR-2026-004821"
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white outline-none px-2 uppercase placeholder:normal-case"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3">
            Your report ID was sent to your email after submission. It starts with <span className="font-semibold text-slate-500 dark:text-slate-400">CR-</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-center text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
          {error}
        </div>
      )}

      {!report && !loading && !error && (
        <div className="max-w-md mx-auto p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileSearch className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Report Selected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Enter your Report Tracking ID above and click <span className="font-semibold text-blue-600 dark:text-blue-400">Track</span> to view its live status and resolution progress.
          </p>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono">
                    {report.reportNumber}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      report.priority === 'Critical'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                        : report.priority === 'High'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    {report.priority} Priority
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {report.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {report.location.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Reported: {new Date(report.reportedAt).toLocaleDateString()} at{' '}
                    {new Date(report.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Status Pill Badge */}
              <div className="text-right sm:text-right">
                <span className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                  Current Case State
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                    report.status === 'Resolved' || report.status === 'Closed'
                      ? 'bg-emerald-600 text-white'
                      : report.status === 'In Progress'
                      ? 'bg-indigo-600 text-white'
                      : report.status === 'Assigned'
                      ? 'bg-purple-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {report.status}
                </span>
              </div>
            </div>

            {/* Visual Lifecycle Progress Timeline */}
            <div className="py-8">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-6">
                Visual Resolution Journey
              </h3>

              <div className="relative">
                {/* Background Connecting Line */}
                <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-800 -z-0 hidden md:block" />

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 relative z-10">
                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900 shadow-md scale-110'
                              : isDone
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs mt-2 font-semibold ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400 font-bold'
                              : isDone
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description & Assignment Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="md:col-span-2 space-y-3">
                <span className="font-bold text-slate-400 uppercase text-[10px]">
                  Description & Evidence
                </span>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {report.description}
                </p>

                {report.media && report.media.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      Reported Photos ({report.media.length}):
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {report.media.map((img) => (
                        <a
                          key={img.id}
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group block"
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-24 h-24 object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-400 uppercase text-[10px]">
                  Assigned Response Unit
                </span>
                {report.assignment ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>{report.assignment.department}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Officer in Charge: <strong>{report.assignment.officerName}</strong>
                    </div>
                    <div className="text-slate-500">
                      Assigned On: {new Date(report.assignment.assignedAt).toLocaleDateString()}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Target SLA Due: {new Date(report.assignment.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic">
                    Case is in administrative triage. Unit assignment pending.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Evidence Card (PRD Section 17 & 40) */}
          {report.resolutionEvidence && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Verified Resolution Evidence</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {report.resolutionEvidence.notes}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Completed by: <strong>{report.resolutionEvidence.completedBy}</strong></span>
                <span>
                  Date: {new Date(report.resolutionEvidence.completedAt).toLocaleDateString()}
                </span>
              </div>

              {report.resolutionEvidence.photos && report.resolutionEvidence.photos.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-2">
                    After-Resolution Photographs:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {report.resolutionEvidence.photos.map((pUrl, i) => (
                      <img
                        key={i}
                        src={pUrl}
                        alt="Resolution evidence"
                        className="w-32 h-32 rounded-xl object-cover border-2 border-emerald-500/40 shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resident Satisfaction Feedback (PRD Section 40) */}
          {(report.status === 'Resolved' || report.status === 'Closed') && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Resident Resolution Feedback
                </h3>
              </div>

              {report.feedback || feedbackSuccess ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thank you! Your feedback has been recorded.</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Resolution Satisfactory:{' '}
                    <strong>{report.feedback?.satisfied ? 'Yes (Satisfied)' : 'No (Needs Attention)'}</strong>
                    {' • '}
                    Rating: {report.feedback?.rating}/5 Stars
                  </div>
                  {report.feedback?.comments && (
                    <div className="text-xs italic text-slate-500">
                      "{report.feedback.comments}"
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Was this community issue resolved to your satisfaction?
                  </p>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFeedbackSatisfied(true)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                        feedbackSatisfied
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Yes, Satisfied
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackSatisfied(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                        !feedbackSatisfied
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No, Issues Remain
                    </button>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Rate the Resolution Speed & Quality
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`p-1 transition-colors ${
                            star <= feedbackRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Comments or Observations (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      placeholder="Share your feedback with community leadership..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingFeedback ? 'Submitting...' : 'Submit Resolution Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Status History Audit Trail (PRD Section 11 & 32) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Audit & Transition Trail
            </h3>
            <div className="space-y-3">
              {report.statusHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-start gap-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.newStatus}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      By: <strong>{item.changedBy}</strong>
                    </div>
                    {item.notes && <div className="text-slate-600 dark:text-slate-300 mt-1">{item.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
