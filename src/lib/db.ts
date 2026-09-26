import { IssueReport, AuditLogEntry, ReportStatus, ReportPriority } from './types';

// In-memory persistent state across hot-reloads during server lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __CIVIC_REPORTS__: IssueReport[] | undefined;
  // eslint-disable-next-line no-var
  var __CIVIC_AUDIT_LOGS__: AuditLogEntry[] | undefined;
}

// Clean start — all reports and audit logs come from real user submissions stored in Firestore
const INITIAL_REPORTS: IssueReport[] = [];
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

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
  // Persist to Firestore with error logging
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

  // Await persist to Firestore directly so serverless functions do not terminate early
  try {
    const { saveReportToFirestore } = await import('./firestoreService');
    const success = await saveReportToFirestore(newReport);
    if (!success) {
      console.warn('[Firestore] Failed to save report to Firestore.');
    }
  } catch (err) {
    console.warn('[Firestore] Error saving report to Firestore:', err);
  }

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
  if (index !== -1) {
    reports[index] = { ...reports[index], ...updates };
  }

  // Await persist to Firestore directly
  try {
    const { updateReportInFirestore } = await import('./firestoreService');
    const targetId = index !== -1 ? reports[index].id : id;
    await updateReportInFirestore(targetId, updates);
  } catch (err) {
    console.warn('[Firestore] Error updating report in Firestore:', err);
  }

  return index !== -1 ? reports[index] : null;
}

/**
 * Fetch all reports: first queries Firestore for live data, making Firestore authoritative.
 */
export async function getAllReports(): Promise<IssueReport[]> {
  try {
    const { fetchReportsFromFirestore } = await import('./firestoreService');
    const firestoreReports = await fetchReportsFromFirestore();

    if (Array.isArray(firestoreReports)) {
      firestoreReports.sort(
        (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
      );
      global.__CIVIC_REPORTS__ = firestoreReports;
      return firestoreReports;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching reports, falling back to local database:', err);
  }

  return getDatabase().reports;
}

/**
 * Fetch a single report by ID or reportNumber from Firestore or memory.
 */
export async function getReportByIdOrNumber(identifier: string): Promise<IssueReport | null> {
  const trimmed = identifier.trim();

  // Try fetching from Firestore first for authoritative data
  try {
    const { fetchReportByIdOrNumber } = await import('./firestoreService');
    const firestoreReport = await fetchReportByIdOrNumber(trimmed);
    if (firestoreReport) {
      const { reports } = getDatabase();
      const existingIdx = reports.findIndex((r) => r.id === firestoreReport.id);
      if (existingIdx !== -1) {
        reports[existingIdx] = firestoreReport;
      } else {
        reports.unshift(firestoreReport);
      }
      return firestoreReport;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching report by ID from Firestore:', err);
  }

  // Fallback to local memory
  const { reports } = getDatabase();
  return (
    reports.find(
      (r) => r.id === trimmed || r.reportNumber.toLowerCase() === trimmed.toLowerCase()
    ) || null
  );
}

/**
 * Fetch all audit logs from Firestore or memory.
 */
export async function getAllAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const { fetchAuditLogsFromFirestore } = await import('./firestoreService');
    const firestoreLogs = await fetchAuditLogsFromFirestore();
    if (Array.isArray(firestoreLogs)) {
      global.__CIVIC_AUDIT_LOGS__ = firestoreLogs;
      return firestoreLogs;
    }
  } catch (err) {
    console.warn('[Firestore] Error fetching audit logs from Firestore:', err);
  }

  return getDatabase().auditLogs;
}

/**
 * Delete a report by ID or reportNumber from memory and Firestore.
 */
export async function deleteReport(identifier: string): Promise<boolean> {
  const { reports } = getDatabase();
  const trimmed = identifier.trim();
  const index = reports.findIndex(
    (r) => r.id === trimmed || r.reportNumber.toLowerCase() === trimmed.toLowerCase()
  );
  let targetId = trimmed;
  if (index !== -1) {
    targetId = reports[index].id;
    reports.splice(index, 1);
  }

  try {
    const { deleteReportFromFirestore } = await import('./firestoreService');
    await deleteReportFromFirestore(targetId);
  } catch (err) {
    console.warn('[Firestore] Error deleting report:', err);
  }

  return true;
}

/**
 * Clear all reports and audit logs from memory and Firestore.
 */
export async function clearAllData(): Promise<{ reportsCleared: number; logsCleared: number }> {
  const count = getDatabase().reports.length;
  const logCount = getDatabase().auditLogs.length;

  global.__CIVIC_REPORTS__ = [];
  global.__CIVIC_AUDIT_LOGS__ = [];

  try {
    const { clearAllFromFirestore } = await import('./firestoreService');
    await clearAllFromFirestore();
  } catch (err) {
    console.warn('[Firestore] Error clearing Firestore:', err);
  }

  return { reportsCleared: count, logsCleared: logCount };
}

export { INITIAL_REPORTS, INITIAL_AUDIT_LOGS };
