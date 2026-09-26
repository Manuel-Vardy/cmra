import { IssueReport, AuditLogEntry, ReportStatus, ReportPriority } from './types';

// In-memory persistent state across hot-reloads during server lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __CIVIC_REPORTS__: IssueReport[] | undefined;
  // eslint-disable-next-line no-var
  var __CIVIC_AUDIT_LOGS__: AuditLogEntry[] | undefined;
}

const INITIAL_REPORTS: IssueReport[] = [
  {
    id: 'rep-001',
    reportNumber: 'CR-2026-004821',
    title: 'Blocked Drainage on Market Street',
    description:
      'The main drainage channel beside the community market is blocked with plastic waste and mud. Water is overflowing onto the road and affecting nearby shops.',
    category: 'Environment',
    subCategory: 'Open Drains / Flooding',
    status: 'In Progress',
    priority: 'High',
    slaTargetHours: 6,
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: '142 Market Street, near Central Market Plaza',
      town: 'Metro District',
      community: 'Downtown Central',
    },
    media: [
      {
        id: 'm1',
        type: 'image',
        name: 'overflowing_drain.jpg',
        url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        size: '2.4 MB',
      },
      {
        id: 'm2',
        type: 'image',
        name: 'debris_accumulation.jpg',
        url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
        size: '3.1 MB',
      },
    ],
    reporter: {
      fullName: 'Marcus Vance',
      email: 'm.vance@example.com',
      phone: '+1 (555) 234-8901',
      town: 'Metro District',
      community: 'Downtown Central',
      isAnonymous: false,
    },
    reportedAt: '2026-08-28T10:32:00.000Z',
    updatedAt: '2026-08-28T11:45:00.000Z',
    assignment: {
      department: 'Sanitation Department',
      officerName: 'Capt. David Brooks',
      assignedBy: 'Elena Gomez (Admin)',
      assignedAt: '2026-08-28T11:05:00.000Z',
      dueDate: '2026-08-29T18:00:00.000Z',
    },
    statusHistory: [
      {
        id: 'sh-1',
        oldStatus: 'None',
        newStatus: 'Submitted',
        changedBy: 'Marcus Vance (Citizen)',
        role: 'resident',
        timestamp: '2026-08-28T10:32:00.000Z',
        notes: 'Initial report submitted via web portal',
      },
      {
        id: 'sh-2',
        oldStatus: 'Submitted',
        newStatus: 'Verified',
        changedBy: 'Elena Gomez',
        role: 'community_admin',
        timestamp: '2026-08-28T10:48:00.000Z',
        notes: 'Dispatched verification check with market security camera feed.',
      },
      {
        id: 'sh-3',
        oldStatus: 'Verified',
        newStatus: 'Assigned',
        changedBy: 'Elena Gomez',
        role: 'community_admin',
        timestamp: '2026-08-28T11:05:00.000Z',
        notes: 'Assigned to Sanitation Field Unit 3 for immediate unblocking.',
      },
      {
        id: 'sh-4',
        oldStatus: 'Assigned',
        newStatus: 'In Progress',
        changedBy: 'Capt. David Brooks',
        role: 'field_officer',
        timestamp: '2026-08-28T11:45:00.000Z',
        notes: 'Team arrived on site with suction pump and excavators.',
      },
    ],
    comments: [
      {
        id: 'c-1',
        userName: 'Elena Gomez',
        userRole: 'Community Admin',
        text: 'Notified market management committee that work is commencing.',
        createdAt: '2026-08-28T11:10:00.000Z',
        isInternal: true,
      },
      {
        id: 'c-2',
        userName: 'Capt. David Brooks',
        userRole: 'Field Officer',
        text: 'High water volume due to afternoon storm; clearing sludge first.',
        createdAt: '2026-08-28T12:00:00.000Z',
        isInternal: false,
      },
    ],
  },
  {
    id: 'rep-002',
    reportNumber: 'CR-2026-004825',
    title: 'Deep Hazardous Pothole on Oakridge Avenue',
    description:
      'Large pothole expanding rapidly after heavy rain. At least two cars have sustained tire blowouts this morning.',
    category: 'Infrastructure',
    subCategory: 'Roads & Pavement',
    status: 'Assigned',
    priority: 'Critical',
    slaTargetHours: 1,
    location: {
      latitude: 40.718,
      longitude: -74.015,
      address: '78 Oakridge Ave, near 4th cross junction',
      town: 'Metro District',
      community: 'Oakridge Heights',
    },
    media: [
      {
        id: 'm3',
        type: 'image',
        name: 'road_damage_crater.jpg',
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        size: '1.8 MB',
      },
    ],
    reporter: {
      fullName: 'Sarah Chen',
      email: 'schen.urban@example.org',
      phone: '+1 (555) 789-0144',
      town: 'Metro District',
      community: 'Oakridge Heights',
      isAnonymous: false,
    },
    reportedAt: '2026-08-28T12:15:00.000Z',
    updatedAt: '2026-08-28T12:35:00.000Z',
    assignment: {
      department: 'Public Works / Road Maintenance',
      officerName: 'Arthur Pendelton',
      assignedBy: 'System Auto-Router (Critical SLA)',
      assignedAt: '2026-08-28T12:35:00.000Z',
      dueDate: '2026-08-28T16:00:00.000Z',
    },
    statusHistory: [
      {
        id: 'sh-201',
        oldStatus: 'None',
        newStatus: 'Submitted',
        changedBy: 'Sarah Chen',
        role: 'resident',
        timestamp: '2026-08-28T12:15:00.000Z',
      },
      {
        id: 'sh-202',
        oldStatus: 'Submitted',
        newStatus: 'Verified',
        changedBy: 'Elena Gomez',
        role: 'community_admin',
        timestamp: '2026-08-28T12:25:00.000Z',
      },
      {
        id: 'sh-203',
        oldStatus: 'Verified',
        newStatus: 'Assigned',
        changedBy: 'Elena Gomez',
        role: 'community_admin',
        timestamp: '2026-08-28T12:35:00.000Z',
        notes: 'Priority elevated to Critical due to vehicle hazard.',
      },
    ],
    comments: [
      {
        id: 'c-201',
        userName: 'Arthur Pendelton',
        userRole: 'Road Maintenance Lead',
        text: 'Emergency cold patch asphalt crew dispatched.',
        createdAt: '2026-08-28T12:40:00.000Z',
        isInternal: true,
      },
    ],
  },
  {
    id: 'rep-003',
    reportNumber: 'CR-2026-004812',
    title: 'Exposed High Voltage Cable near Children Playground',
    description:
      'Storm knocked down branch which snapped electrical conduits. Live wires hanging 4 feet above children swing set area.',
    category: 'Safety',
    subCategory: 'Exposed Electrical Wires',
    status: 'Resolved',
    priority: 'Critical',
    slaTargetHours: 1,
    location: {
      latitude: 40.709,
      longitude: -74.001,
      address: 'Pine Grove Community Park, North Swing Set',
      town: 'Metro District',
      community: 'Pine Grove',
    },
    media: [
      {
        id: 'm4',
        type: 'image',
        name: 'fallen_power_wire.jpg',
        url: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=800&q=80',
        size: '3.4 MB',
      },
    ],
    reporter: {
      fullName: 'Anonymous Resident',
      email: 'safety-resident@domain.net',
      phone: '+1 (555) 000-0000',
      town: 'Metro District',
      community: 'Pine Grove',
      isAnonymous: true,
    },
    reportedAt: '2026-08-27T08:10:00.000Z',
    updatedAt: '2026-08-27T08:55:00.000Z',
    resolvedAt: '2026-08-27T08:55:00.000Z',
    assignment: {
      department: 'Electrical Safety & Grid Operations',
      officerName: 'Inspector Liam Vance',
      assignedBy: 'Super Admin',
      assignedAt: '2026-08-27T08:25:00.000Z',
      dueDate: '2026-08-27T09:30:00.000Z',
    },
    resolutionEvidence: {
      photos: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      notes:
        'Power disconnected to the sub-line, downed limb removed, cable re-insulated and secured to elevated conduit post at 15ft height.',
      completedAt: '2026-08-27T08:55:00.000Z',
      completedBy: 'Inspector Liam Vance',
    },
    feedback: {
      satisfied: true,
      rating: 5,
      comments: 'Extremely swift response! Thank you for protecting our kids.',
      submittedAt: '2026-08-27T11:15:00.000Z',
    },
    statusHistory: [
      {
        id: 'sh-301',
        oldStatus: 'None',
        newStatus: 'Submitted',
        changedBy: 'Citizen Reporter',
        role: 'resident',
        timestamp: '2026-08-27T08:10:00.000Z',
      },
      {
        id: 'sh-302',
        oldStatus: 'Submitted',
        newStatus: 'Verified',
        changedBy: 'Super Admin',
        role: 'super_admin',
        timestamp: '2026-08-27T08:15:00.000Z',
      },
      {
        id: 'sh-303',
        oldStatus: 'Verified',
        newStatus: 'Assigned',
        changedBy: 'Super Admin',
        role: 'super_admin',
        timestamp: '2026-08-27T08:25:00.000Z',
      },
      {
        id: 'sh-304',
        oldStatus: 'Assigned',
        newStatus: 'In Progress',
        changedBy: 'Liam Vance',
        role: 'field_officer',
        timestamp: '2026-08-27T08:50:00.000Z',
      },
      {
        id: 'sh-305',
        oldStatus: 'In Progress',
        newStatus: 'Resolved',
        changedBy: 'Liam Vance',
        role: 'field_officer',
        timestamp: '2026-08-27T10:30:00.000Z',
        notes: 'Repair verified and safe voltage test passed.',
      },
      {
        id: 'sh-306',
        oldStatus: 'Resolved',
        newStatus: 'Closed',
        changedBy: 'Super Admin',
        role: 'super_admin',
        timestamp: '2026-08-27T10:45:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 'rep-004',
    reportNumber: 'CR-2026-004830',
    title: 'Broken Streetlights causing darkness along School Zone',
    description:
      'Three consecutive LED light poles are completely dark on Elm Street between 3rd and 5th St, where kids walk home from evening tutoring.',
    category: 'Utilities',
    subCategory: 'Streetlights',
    status: 'Submitted',
    priority: 'Medium',
    slaTargetHours: 24,
    location: {
      latitude: 40.716,
      longitude: -74.009,
      address: '210 Elm Street, East Sidewalk',
      town: 'Metro District',
      community: 'Oakridge Heights',
    },
    media: [
      {
        id: 'm5',
        type: 'image',
        name: 'dark_street.jpg',
        url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
        size: '1.2 MB',
      },
    ],
    reporter: {
      fullName: 'Derrick Hall',
      email: 'dhall@neighborhood.org',
      phone: '+1 (555) 443-9821',
      town: 'Metro District',
      community: 'Oakridge Heights',
      isAnonymous: false,
    },
    reportedAt: '2026-08-28T14:10:00.000Z',
    updatedAt: '2026-08-28T14:10:00.000Z',
    statusHistory: [
      {
        id: 'sh-401',
        oldStatus: 'None',
        newStatus: 'Submitted',
        changedBy: 'Derrick Hall',
        role: 'resident',
        timestamp: '2026-08-28T14:10:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 'rep-005',
    reportNumber: 'CR-2026-004833',
    title: 'Illegal Dumping of Construction Waste in Empty Lot',
    description:
      'Contractor dumped piles of drywall, broken tiles, and rusted nails on vacant land adjacent to residential homes.',
    category: 'Environment',
    subCategory: 'Illegal Dumping',
    status: 'Under Review',
    priority: 'Medium',
    slaTargetHours: 24,
    location: {
      latitude: 40.722,
      longitude: -74.012,
      address: 'Lot 14B, Industrial Way & 9th Ave',
      town: 'Metro District',
      community: 'Harborview',
    },
    media: [
      {
        id: 'm6',
        type: 'image',
        name: 'dumping_site.jpg',
        url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
        size: '2.9 MB',
      },
    ],
    reporter: {
      fullName: 'Tanya Morales',
      email: 'tmorales@home.net',
      phone: '+1 (555) 912-3456',
      town: 'Metro District',
      community: 'Harborview',
      isAnonymous: false,
    },
    reportedAt: '2026-08-28T15:20:00.000Z',
    updatedAt: '2026-08-28T15:35:00.000Z',
    statusHistory: [
      {
        id: 'sh-501',
        oldStatus: 'None',
        newStatus: 'Submitted',
        changedBy: 'Tanya Morales',
        role: 'resident',
        timestamp: '2026-08-28T15:20:00.000Z',
      },
      {
        id: 'sh-502',
        oldStatus: 'Submitted',
        newStatus: 'Under Review',
        changedBy: 'Admin Moderator',
        role: 'moderator',
        timestamp: '2026-08-28T15:35:00.000Z',
        notes: 'Checking municipal land registry to verify owner responsibility.',
      },
    ],
    comments: [],
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    reportId: 'rep-001',
    reportNumber: 'CR-2026-004821',
    action: 'STATUS_CHANGE',
    actor: 'Elena Gomez',
    role: 'Community Admin',
    details: 'Changed status from Under Review to Verified',
    timestamp: '2026-08-28T10:48:00.000Z',
  },
  {
    id: 'aud-2',
    reportId: 'rep-001',
    reportNumber: 'CR-2026-004821',
    action: 'ASSIGNMENT',
    actor: 'Elena Gomez',
    role: 'Community Admin',
    details: 'Report assigned to Sanitation Department (Capt. David Brooks)',
    timestamp: '2026-08-28T11:05:00.000Z',
  },
  {
    id: 'aud-3',
    reportId: 'rep-002',
    reportNumber: 'CR-2026-004825',
    action: 'PRIORITY_ESCALATION',
    actor: 'Elena Gomez',
    role: 'Community Admin',
    details: 'Priority escalated to Critical due to vehicle hazard reports',
    timestamp: '2026-08-28T12:35:00.000Z',
  },
  {
    id: 'aud-4',
    reportId: 'rep-003',
    reportNumber: 'CR-2026-004812',
    action: 'RESOLUTION_SUBMITTED',
    actor: 'Liam Vance',
    role: 'Field Officer',
    details: 'Uploaded resolution evidence and marked status as Resolved',
    timestamp: '2026-08-27T10:30:00.000Z',
  },
];

export function getDatabase() {
  if (!global.__CIVIC_REPORTS__) {
    global.__CIVIC_REPORTS__ = [...INITIAL_REPORTS];
  }
  if (!global.__CIVIC_AUDIT_LOGS__) {
    global.__CIVIC_AUDIT_LOGS__ = [...INITIAL_AUDIT_LOGS];
  }
  return {
    reports: global.__CIVIC_REPORTS__,
    auditLogs: global.__CIVIC_AUDIT_LOGS__,
  };
}

export function generateReportNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CR-${year}-${randomNum}`;
}

export function detectDuplicates(newReport: {
  category: string;
  latitude: number;
  longitude: number;
  community: string;
}): string[] {
  const { reports } = getDatabase();
  const matches: string[] = [];

  for (const report of reports) {
    if (report.status === 'Resolved' || report.status === 'Closed') continue;

    // Check category match
    if (report.category === newReport.category) {
      // Calculate approximate distance in km (Haversine formula approximation)
      const latDiff = Math.abs(report.location.latitude - newReport.latitude) * 111;
      const lonDiff =
        Math.abs(report.location.longitude - newReport.longitude) *
        111 *
        Math.cos((newReport.latitude * Math.PI) / 180);
      const distanceKm = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

      if (distanceKm < 0.8 || report.location.community.toLowerCase() === newReport.community.toLowerCase()) {
        matches.push(report.reportNumber);
      }
    }
  }

  return matches;
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const { auditLogs } = getDatabase();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(newEntry);
  // Persist to Firestore in background
  import('./firestoreService').then(({ saveAuditLogToFirestore }) => {
    saveAuditLogToFirestore(newEntry).catch((err) => {
      console.warn('[Firestore] Background audit log write failed:', err);
    });
  });
  return newEntry;
}

export async function addReport(newReport: IssueReport): Promise<IssueReport> {
  const { reports } = getDatabase();
  reports.unshift(newReport);
  // Persist to Firestore in background
  const { saveReportToFirestore } = await import('./firestoreService');
  saveReportToFirestore(newReport).catch((err) => {
    console.warn('[Firestore] Background report write failed:', err);
  });
  return newReport;
}

export async function updateReport(
  id: string,
  updates: Partial<IssueReport>
): Promise<IssueReport | null> {
  const { reports } = getDatabase();
  const index = reports.findIndex(
    (r) => r.id === id || r.reportNumber.toLowerCase() === id.toLowerCase()
  );
  if (index === -1) return null;

  reports[index] = { ...reports[index], ...updates };
  // Persist to Firestore in background
  const { updateReportInFirestore } = await import('./firestoreService');
  updateReportInFirestore(reports[index].id, updates).catch((err) => {
    console.warn('[Firestore] Background report update failed:', err);
  });
  return reports[index];
}

export { INITIAL_REPORTS, INITIAL_AUDIT_LOGS };
