import L from 'leaflet';

export function createColorIcon(color: string, label?: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12 0 C5.37 0 0 5.37 0 12 C0 21 12 36 12 36 C12 36 24 21 24 12 C24 5.37 18.63 0 12 0 Z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="12" cy="12" r="6" fill="#ffffff" />
      <circle cx="12" cy="12" r="3.5" fill="${color}" />
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="display:flex; flex-direction:column; align-items:center;">
      ${svg}
      ${label ? `<span style="background:#1e293b; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:10px; margin-top:-6px; white-space:nowrap; box-shadow:0 1px 3px rgba(0,0,0,0.3);">${label}</span>` : ''}
    </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40],
  });
}

export function getPriorityMarker(priority: string) {
  switch (priority) {
    case 'Critical':
      return createColorIcon('#ef4444', 'CRITICAL');
    case 'High':
      return createColorIcon('#f97316', 'HIGH');
    case 'Medium':
      return createColorIcon('#f59e0b', 'MED');
    case 'Low':
    default:
      return createColorIcon('#3b82f6', 'LOW');
  }
}

export function getStatusMarker(status: string) {
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return createColorIcon('#10b981', 'RESOLVED');
    case 'In Progress':
      return createColorIcon('#6366f1', 'IN PROGRESS');
    case 'Assigned':
      return createColorIcon('#8b5cf6', 'ASSIGNED');
    case 'Verified':
      return createColorIcon('#06b6d4', 'VERIFIED');
    case 'Under Review':
      return createColorIcon('#f59e0b', 'REVIEW');
    default:
      return createColorIcon('#ec4899', 'NEW');
  }
}
