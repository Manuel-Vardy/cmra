'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IssueReport } from '@/lib/types';
import { getPriorityMarker } from './leafletIcons';

interface CommunityMapViewProps {
  reports: IssueReport[];
  onSelectReport?: (report: IssueReport) => void;
  isPublicMode?: boolean;
  selectedReportId?: string;
}

export default function CommunityMapView({
  reports,
  onSelectReport,
  isPublicMode = false,
  selectedReportId,
}: CommunityMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around reports or Metro central
      const centerLat = reports.length > 0 ? reports[0].location.latitude : 40.7128;
      const centerLng = reports.length > 0 ? reports[0].location.longitude : -74.006;

      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: true,
      }).setView([centerLat, centerLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers whenever reports list changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    reports.forEach((report) => {
      const { latitude, longitude } = report.location;
      if (!latitude || !longitude) return;

      const icon = getPriorityMarker(report.priority);
      const marker = L.marker([latitude, longitude], { icon });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 210px; max-width: 260px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">${report.reportNumber}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; font-weight: 700; 
              background: ${
                report.priority === 'Critical'
                  ? '#fee2e2; color: #b91c1c;'
                  : report.priority === 'High'
                  ? '#ffedd5; color: #c2410c;'
                  : '#fef3c7; color: #b45309;'
              }">
              ${report.priority}
            </span>
          </div>

          <h4 style="font-size: 13px; font-weight: 600; margin: 0 0 4px 0; color: #0f172a; line-height: 1.3;">
            ${report.title}
          </h4>

          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 11px; color: #64748b;">${report.category}</span>
            <span style="font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600;
              background: ${report.status === 'Resolved' ? '#dcfce7; color: #15803d;' : '#e0e7ff; color: #4338ca;'};">
              ${report.status}
            </span>
          </div>

          <p style="font-size: 11px; color: #334155; margin: 0 0 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${report.description}
          </p>

          ${
            !isPublicMode
              ? `<div style="font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-bottom: 6px;">
                   <strong>Reporter:</strong> ${report.reporter.isAnonymous ? 'Anonymous' : report.reporter.fullName}
                 </div>`
              : ''
          }

          <button id="view-report-${report.id}" style="
            width: 100%;
            background: #2563eb;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">
            ${isPublicMode ? 'Track This Case' : 'Manage & Triage Case'}
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-report-${report.id}`);
        if (btn && onSelectReport) {
          btn.onclick = () => {
            onSelectReport(report);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.push([latitude, longitude]);
    });

    if (bounds.length > 0 && !selectedReportId) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }, [reports, isPublicMode, onSelectReport, selectedReportId]);

  return (
    <div className="w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-0" />
      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 text-xs z-10 flex items-center gap-3">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Priority Legend:</span>
        <span className="flex items-center gap-1 text-red-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical
        </span>
        <span className="flex items-center gap-1 text-orange-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High
        </span>
        <span className="flex items-center gap-1 text-amber-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium
        </span>
        <span className="flex items-center gap-1 text-blue-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Low
        </span>
      </div>
    </div>
  );
}
