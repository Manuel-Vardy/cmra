'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  MessageSquare,
  Shield,
  FileText,
  ExternalLink,
  GitMerge,
  Send,
} from 'lucide-react';
import {
  IssueReport,
  ReportStatus,
  ReportPriority,
  UserRole,
} from '@/lib/types';

interface ReportDetailDrawerProps {
  report: IssueReport | null;
  onClose: () => void;
  onUpdate: (updatedReport: IssueReport) => void;
  currentRole: UserRole;
  currentUserName?: string;
}

const DEPARTMENTS = [
  'Sanitation Department',
  'Public Works / Road Maintenance',
  'Electrical Safety & Grid Operations',
  'Water & Sewage Authority',
  'Parks & Recreation',
  'Community Safety & Bylaw',
];

const RESOLUTION_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
];

export default function ReportDetailDrawer({
  report,
  onClose,
  onUpdate,
  currentRole,
  currentUserName = 'Elena Gomez (Admin)',
}: ReportDetailDrawerProps) {
  if (!report) return null;

  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [priority, setPriority] = useState<ReportPriority>(report.priority);
  const [department, setDepartment] = useState(
    report.assignment?.department || DEPARTMENTS[0]
  );
  const [officerName, setOfficerName] = useState(
    report.assignment?.officerName || 'Duty Dispatcher'
  );
  const [dueDate, setDueDate] = useState(
    report.assignment?.dueDate?.split('T')[0] ||
      new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  // Resolution evidence form
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhotos, setResolutionPhotos] = useState<string[]>([
    RESOLUTION_SAMPLE_PHOTOS[0],
  ]);

  // Notes/Comments
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);

  const [saving, setSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const handleStatusChange = async (newStatus: ReportStatus) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actorName: currentUserName,
          actorRole: currentRole,
          statusNotes: `Status changed to ${newStatus} by ${currentUserName}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.report);
        setActionNotice(`Status updated to ${newStatus}`);
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePriorityChange = async (newPriority: ReportPriority) => {
    setPriority(newPriority);
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: newPriority,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.report);
        setActionNotice(`Priority updated to ${newPriority}`);
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment: {
            department,
            officerName,
            dueDate: new Date(dueDate).toISOString(),
          },
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.report);
        setActionNotice(`Report assigned to ${department}`);
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionEvidence: {
            photos: resolutionPhotos,
            notes: resolutionNotes || 'Work completed and site verified safe.',
          },
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.report);
        setShowResolutionForm(false);
        setActionNotice('Resolution evidence recorded & case marked Resolved!');
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentText: newComment.trim(),
          isInternal: isInternalComment,
          actorName: currentUserName,
          actorRole: currentRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.report);
        setNewComment('');
        setActionNotice('Comment added');
        setTimeout(() => setActionNotice(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slideLeft">
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                {report.reportNumber}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {report.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {report.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback flash */}
        {actionNotice && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Potential duplicate detection banner */}
        {report.potentialDuplicates && report.potentialDuplicates.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
            <GitMerge className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-bold">Duplicate Detection System Alert:</span>
              <p className="mt-0.5">
                Nearby matching reports detected: <strong>{report.potentialDuplicates.join(', ')}</strong>. You can consolidate and merge notes to avoid redundant dispatch.
              </p>
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Quick Status & Priority Control Panel */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                disabled={saving}
                onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="Submitted">Submitted (New)</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected / Invalid</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Priority & SLA Target
              </label>
              <select
                value={priority}
                disabled={saving}
                onChange={(e) => handlePriorityChange(e.target.value as ReportPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="Critical">Critical (1h SLA Target)</option>
                <option value="High">High (6h SLA Target)</option>
                <option value="Medium">Medium (24h SLA Target)</option>
                <option value="Low">Low (72h SLA Target)</option>
              </select>
            </div>
          </div>

          {/* Reporter & Location Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reporter details */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">
                Resident Contact Information
              </span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <User className="w-4 h-4 text-blue-600" />
                <span>
                  {report.reporter.isAnonymous ? 'Anonymous Citizen' : report.reporter.fullName}
                </span>
              </div>
              {!report.reporter.isAnonymous && (
                <>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${report.reporter.email}`} className="hover:underline">
                      {report.reporter.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${report.reporter.phone}`} className="hover:underline">
                      {report.reporter.phone || 'No phone provided'}
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Location Details */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">
                Location & Coordinates
              </span>
              <div className="flex items-start gap-2 text-slate-900 dark:text-white font-semibold">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{report.location.address}</span>
              </div>
              <div className="text-slate-500">
                Community: <strong>{report.location.community}</strong> ({report.location.town})
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                GPS: {report.location.latitude}, {report.location.longitude}
              </div>
            </div>
          </div>

          {/* Description & Photos */}
          <div className="space-y-3">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">
              Case Narrative
            </span>
            <p className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-700 dark:text-slate-200 text-sm leading-relaxed border border-slate-100 dark:border-slate-800">
              {report.description}
            </p>

            {report.media && report.media.length > 0 && (
              <div>
                <span className="font-semibold text-slate-500 text-[11px] block mb-2">
                  Attached Citizen Media ({report.media.length}):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.media.map((m) => (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 block"
                    >
                      <img
                        src={m.url}
                        alt={m.name}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[10px] px-2 py-1 truncate">
                        {m.name}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assignment Section (PRD Section 16) */}
          <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" />
                Department & Field Officer Assignment
              </span>
              {report.assignment && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  Assigned
                </span>
              )}
            </div>

            <form onSubmit={handleAssign} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Lead Field Officer
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Officer John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Due Target:</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>

          {/* Resolution Evidence Section (PRD Section 17) */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Resolution Evidence & Sign-off
              </span>

              {!showResolutionForm && !report.resolutionEvidence && (
                <button
                  type="button"
                  onClick={() => setShowResolutionForm(true)}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                >
                  + Add Resolution Evidence
                </button>
              )}
            </div>

            {report.resolutionEvidence && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl space-y-2 border border-emerald-100 dark:border-emerald-900">
                <p className="text-slate-700 dark:text-slate-200 text-xs">
                  {report.resolutionEvidence.notes}
                </p>
                <div className="text-[11px] text-slate-500">
                  Signed off by <strong>{report.resolutionEvidence.completedBy}</strong> on{' '}
                  {new Date(report.resolutionEvidence.completedAt).toLocaleDateString()}
                </div>
                {report.resolutionEvidence.photos && (
                  <div className="flex gap-2 pt-1">
                    {report.resolutionEvidence.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt="Evidence"
                        className="w-20 h-20 rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {showResolutionForm && (
              <form onSubmit={handleSubmitResolution} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resolution Notes & Actions Taken *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe specific repairs or actions completed..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    After-Resolution Photo Evidence URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={resolutionPhotos[0] || ''}
                      onChange={(e) => setResolutionPhotos([e.target.value])}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setResolutionPhotos([RESOLUTION_SAMPLE_PHOTOS[1]])}
                      className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 rounded-lg border text-slate-600 dark:text-slate-300"
                    >
                      Sample Photo
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResolutionForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    Complete & Resolve Case
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Internal Comments & Notes Thread */}
          <div className="space-y-3">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">
              Case Discussion & Administrative Notes
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {report.comments && report.comments.length > 0 ? (
                report.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border ${
                      c.isInternal
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.userName} ({c.userRole})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">
                      {c.text}
                    </p>
                    {c.isInternal && (
                      <span className="inline-block mt-1 text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.2 rounded">
                        Internal Staff Only
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-400 italic text-center py-2">
                  No notes recorded yet.
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add note or instruction..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                type="submit"
                disabled={saving || !newComment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>

          {/* Status Transition History (PRD Section 11 & 32) */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">
              Status Change Audit History
            </span>
            <div className="space-y-2">
              {report.statusHistory.map((sh) => (
                <div
                  key={sh.id}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px]"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {sh.newStatus}
                    </span>{' '}
                    — by {sh.changedBy} on {new Date(sh.timestamp).toLocaleString()}
                    {sh.notes && <div className="text-slate-500 text-[10px]">{sh.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
