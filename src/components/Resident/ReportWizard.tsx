'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Camera,
  Video,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileCheck,
  Shield,
  HelpCircle,
  Building2,
  Droplets,
  Zap,
  HardHat,
  Trees,
  Copy,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IssueCategory, ReportPriority, IssueReport, ReportMedia } from '@/lib/types';
import MediaEvidenceUploader from './MediaEvidenceUploader';

// Dynamic import of Leaflet map to disable SSR
const LocationPickerMap = dynamic(() => import('../Map/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm">
      Loading interactive map...
    </div>
  ),
});

const CATEGORIES: {
  id: IssueCategory;
  name: string;
  icon: any;
  color: string;
  subcategories: string[];
}[] = [
  {
    id: 'Infrastructure',
    name: 'Infrastructure',
    icon: Building2,
    color: 'from-blue-500 to-indigo-600',
    subcategories: ['Roads & Pavement', 'Bridges & Culverts', 'Sidewalks', 'Streetlights', 'Public Buildings'],
  },
  {
    id: 'Environment',
    name: 'Environment',
    icon: Trees,
    color: 'from-emerald-500 to-teal-600',
    subcategories: ['Garbage Accumulation', 'Illegal Dumping', 'Pollution / Odors', 'Open Drains / Flooding', 'Fallen Trees'],
  },
  {
    id: 'Utilities',
    name: 'Utilities',
    icon: Droplets,
    color: 'from-cyan-500 to-blue-600',
    subcategories: ['Water Supply Burst', 'Electricity Outage', 'Sewage Overflow', 'Telecommunications Lines'],
  },
  {
    id: 'Safety',
    name: 'Safety & Hazards',
    icon: Zap,
    color: 'from-amber-500 to-red-600',
    subcategories: ['Dangerous Structures', 'Road Hazards / Sinkholes', 'Exposed Electrical Wires', 'Missing Manhole Cover'],
  },
  {
    id: 'Public Services',
    name: 'Public Services',
    icon: HardHat,
    color: 'from-purple-500 to-indigo-600',
    subcategories: ['Schools Zone Safety', 'Health Facilities', 'Public Toilets', 'Community Markets', 'Parks & Playgrounds'],
  },
  {
    id: 'Other',
    name: 'Other Community Issue',
    icon: HelpCircle,
    color: 'from-slate-500 to-slate-700',
    subcategories: ['General Community Concern', 'Noise Complaint', 'Animal Hazard'],
  },
];


interface ReportWizardProps {
  onReportCreated?: (report: IssueReport) => void;
  onTrackReport?: (reportNumber: string) => void;
  initialCategory?: IssueCategory;
  onBackToHome?: () => void;
}

export default function ReportWizard({
  onReportCreated,
  onTrackReport,
  initialCategory = 'Environment',
  onBackToHome,
}: ReportWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<IssueReport | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Reporter Contact
    fullName: '',
    email: '',
    phone: '',
    town: '',
    community: '',
    isAnonymous: false,

    // Step 2: Issue details
    category: initialCategory,
    subCategory: CATEGORIES.find((c) => c.id === initialCategory)?.subcategories[0] || 'Open Drains / Flooding',
    title: '',
    description: '',
    priority: 'Medium' as ReportPriority,

    // Step 3: Media (empty by default — residents upload or capture their own)
    media: [] as ReportMedia[],
    videoUrl: '',

    // Step 4: Location
    latitude: 5.6037,
    longitude: -0.187,
    address: '',
  });

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.isAnonymous && (!formData.fullName.trim() || !formData.email.trim())) {
        setErrorMessage('Please provide your name and email or check "Report Anonymously".');
        scrollToTop();
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.title.trim() || !formData.description.trim()) {
        setErrorMessage('Please provide a title and detailed description of the problem.');
        scrollToTop();
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.address.trim()) {
        setErrorMessage('Please specify or verify the address/location.');
        scrollToTop();
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
    scrollToTop();
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
    scrollToTop();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subCategory: formData.subCategory,
          priority: formData.priority,
          location: {
            latitude: formData.latitude,
            longitude: formData.longitude,
            address: formData.address,
            town: formData.town,
            community: formData.community,
          },
          media: formData.media,
          reporter: {
            fullName: formData.isAnonymous ? 'Anonymous Resident' : formData.fullName,
            email: formData.isAnonymous ? '' : formData.email,
            phone: formData.isAnonymous ? '' : formData.phone,
            town: formData.town,
            community: formData.community,
            isAnonymous: formData.isAnonymous,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSubmittedReport(data.report);
      triggerConfetti();
      if (onReportCreated) onReportCreated(data.report);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully submitted, show receipt and celebration card
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-8 ring-emerald-50 dark:ring-emerald-900/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Report Submitted Successfully!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
              Thank you for helping keep our community safe and functional. Your report has been dispatched to the municipal review queue.
            </p>
          </div>

          {/* Report ID Card */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs uppercase font-bold text-slate-400">Unique Tracking Number</span>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                {submittedReport.reportNumber}
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(submittedReport.reportNumber);
                setCopiedId(true);
                setTimeout(() => setCopiedId(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4 text-blue-600" />
              {copiedId ? 'Copied!' : 'Copy ID'}
            </button>
          </div>

          {/* Potential duplicate detection notice */}
          {submittedReport.potentialDuplicates && submittedReport.potentialDuplicates.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-left flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <span className="font-bold">Nearby Matching Report Detected:</span>
                <p className="mt-1">
                  We noticed an active report ({submittedReport.potentialDuplicates.join(', ')}) in this vicinity for the same category. Your submission will be linked to bolster the case priority.
                </p>
              </div>
            </div>
          )}

          {/* Summary Box */}
          <div className="text-left text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedReport.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedReport.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedReport.location.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expected Response SLA:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Within {submittedReport.slaTargetHours} hours
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onTrackReport && onTrackReport(submittedReport.reportNumber)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              Track Status Now
            </button>
            <button
              onClick={() => {
                setSubmittedReport(null);
                setCurrentStep(1);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  town: 'Metro District',
                  community: 'Downtown Central',
                  isAnonymous: false,
                  category: 'Environment',
                  subCategory: 'Open Drains / Flooding',
                  title: '',
                  description: '',
                  priority: 'Medium',
                  media: [],
                  videoUrl: '',
                  latitude: 40.7128,
                  longitude: -74.006,
                  address: '',
                });
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 transition"
            >
              Report Another Problem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <span>Step {currentStep} of 5</span>
          <span>
            {currentStep === 1 && 'Reporter Identity'}
            {currentStep === 2 && 'Issue Details'}
            {currentStep === 3 && 'Photo & Video Evidence'}
            {currentStep === 4 && 'Map & Location'}
            {currentStep === 5 && 'Review & Dispatch'}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Reporter Contact Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 1: Your Information
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Help our municipal field teams contact you with updates and resolution confirmation.
              </p>
            </div>

            {/* Anonymous Toggle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Report Anonymously
                  </div>
                  <div className="text-xs text-slate-500">
                    Your name and email will not be linked to the public record.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {!formData.isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. m.vance@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone / Contact Number (Optional SMS)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 234-8901"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Community / Neighborhood *
                  </label>
                  <select
                    value={formData.community}
                    onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Downtown Central">Downtown Central</option>
                    <option value="Oakridge Heights">Oakridge Heights</option>
                    <option value="Pine Grove">Pine Grove</option>
                    <option value="Harborview">Harborview</option>
                    <option value="Riverside Park">Riverside Park</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Issue Details & Category */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 2: Issue Details
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Select the problem category and describe what happened.
              </p>
            </div>

            {/* Category Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          category: cat.id,
                          subCategory: cat.subcategories[0] || '',
                        });
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-2 shadow-sm`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {cat.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Subcategory
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.find((c) => c.id === formData.category)?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Headline / Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Blocked drainage causing street flooding"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the severity, how long it has been present, and any immediate hazard..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Severity / Priority selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Perceived Severity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Critical'] as ReportPriority[]).map((p) => {
                  const isSel = formData.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        isSel
                          ? p === 'Critical'
                            ? 'bg-red-600 text-white border-red-600'
                            : p === 'High'
                            ? 'bg-orange-500 text-white border-orange-500'
                            : p === 'Medium'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Media Upload (Live Camera & Folder Browser) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 3: Visual Evidence (Camera & Folders)
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Open your camera to snap a live photo, or browse your folders to attach multiple photos and videos.
              </p>
            </div>

            <MediaEvidenceUploader
              mediaList={formData.media}
              onMediaChange={(newMedia) => {
                setFormData((prev) => ({ ...prev, media: newMedia }));
              }}
            />
          </div>
        )}

        {/* STEP 4: Location & Interactive Map Pin */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 4: Location Verification
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Pin the exact location on the interactive map or capture GPS.
              </p>
            </div>

            <LocationPickerMap
              initialLat={formData.latitude}
              initialLng={formData.longitude}
              onLocationChange={(lat, lng, address) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                  address: address || prev.address,
                }));
              }}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Readable Street Address / Landmark *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 142 Market Street, near Central Market Plaza"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 5: Review Your Report
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Please verify all details before submitting to municipal dispatch.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Reporter</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {formData.isAnonymous ? 'Anonymous' : formData.fullName}
                  </div>
                  {!formData.isAnonymous && <div className="text-slate-500">{formData.email}</div>}
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Community</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {formData.community}
                  </div>
                  <div className="text-slate-500">{formData.town}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Issue Details</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {formData.title}
                </div>
                <div className="text-slate-600 dark:text-slate-300 mt-1">
                  {formData.description}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded font-semibold">
                    {formData.category} ({formData.subCategory})
                  </span>
                  <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 rounded font-semibold">
                    Priority: {formData.priority}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Location</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {formData.address}
                </div>
                <div className="text-slate-500">
                  Coordinates: {formData.latitude}, {formData.longitude}
                </div>
              </div>

              {formData.media.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block mb-2">
                    Evidence Attached ({formData.media.length} Photos)
                  </span>
                  <div className="flex gap-2">
                    {formData.media.map((m) => (
                      <img
                        key={m.id}
                        src={m.url}
                        alt="Evidence thumbnail"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-600"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:opacity-95 transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              <UploadCloud className="w-5 h-5" />
              {isSubmitting ? 'Submitting Report...' : 'Dispatch Report Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
