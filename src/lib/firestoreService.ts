import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { IssueReport, AuditLogEntry } from './types';

export const REPORTS_COLLECTION = 'reports';
export const AUDIT_LOGS_COLLECTION = 'audit_logs';

/**
 * Fetch all reports from Firestore, ordered by reportedAt desc.
 */
export async function fetchReportsFromFirestore(): Promise<IssueReport[]> {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(reportsRef, orderBy('reportedAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as IssueReport[];
  } catch (error) {
    console.warn('[Firestore] Error fetching reports:', error);
    return [];
  }
}

/**
 * Fetch a single report by ID or reportNumber from Firestore.
 */
export async function fetchReportByIdOrNumber(
  identifier: string
): Promise<IssueReport | null> {
  try {
    // Try by document ID first
    const docRef = doc(db, REPORTS_COLLECTION, identifier);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as IssueReport;
    }

    // Try querying by reportNumber
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      where('reportNumber', '==', identifier.toUpperCase()),
      limit(1)
    );
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const found = querySnap.docs[0];
      return { id: found.id, ...found.data() } as IssueReport;
    }

    return null;
  } catch (error) {
    console.warn('[Firestore] Error fetching report by ID/number:', error);
    return null;
  }
}

function cleanForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Save a new report to Firestore.
 */
export async function saveReportToFirestore(
  report: IssueReport
): Promise<boolean> {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, report.id);
    const cleaned = cleanForFirestore(report);
    await setDoc(docRef, {
      ...cleaned,
      _firestoreCreatedAt: serverTimestamp(),
    });
    console.log(`[Firestore] Saved report ${report.reportNumber} (ID: ${report.id})`);
    return true;
  } catch (error) {
    console.error('[Firestore] Error saving report:', error);
    return false;
  }
}

/**
 * Update an existing report in Firestore.
 */
export async function updateReportInFirestore(
  id: string,
  updates: Partial<IssueReport>
): Promise<boolean> {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    const cleaned = cleanForFirestore(updates);
    await updateDoc(docRef, {
      ...cleaned,
      _firestoreUpdatedAt: serverTimestamp(),
    });
    console.log(`[Firestore] Updated report ${id}`);
    return true;
  } catch (error) {
    console.error('[Firestore] Error updating report:', error);
    return false;
  }
}

/**
 * Fetch audit logs from Firestore.
 */
export async function fetchAuditLogsFromFirestore(): Promise<AuditLogEntry[]> {
  try {
    const logsRef = collection(db, AUDIT_LOGS_COLLECTION);
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as AuditLogEntry[];
  } catch (error) {
    console.warn('[Firestore] Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Save an audit log to Firestore.
 */
export async function saveAuditLogToFirestore(
  log: AuditLogEntry
): Promise<boolean> {
  try {
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, log.id);
    const cleaned = cleanForFirestore(log);
    await setDoc(docRef, {
      ...cleaned,
      _firestoreCreatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('[Firestore] Error saving audit log:', error);
    return false;
  }
}

/**
 * Seed initial sample reports and audit logs into Firestore if empty.
 */
export async function seedFirestoreIfEmpty(
  initialReports: IssueReport[],
  initialLogs: AuditLogEntry[]
): Promise<{ seeded: boolean; reportCount: number; logCount: number }> {
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const snapshot = await getDocs(query(reportsRef, limit(1)));

    if (!snapshot.empty) {
      console.log('[Firestore] Collection already contains data, skipping seed.');
      return { seeded: false, reportCount: snapshot.size, logCount: 0 };
    }

    console.log('[Firestore] Seeding initial data into Firestore...');
    let repCount = 0;
    for (const report of initialReports) {
      await setDoc(doc(db, REPORTS_COLLECTION, report.id), report);
      repCount++;
    }

    let logCount = 0;
    for (const log of initialLogs) {
      await setDoc(doc(db, AUDIT_LOGS_COLLECTION, log.id), log);
      logCount++;
    }

    console.log(`[Firestore] Successfully seeded ${repCount} reports and ${logCount} logs!`);
    return { seeded: true, reportCount: repCount, logCount };
  } catch (error) {
    console.warn('[Firestore] Seeding skipped or encountered error (check rules):', error);
    return { seeded: false, reportCount: 0, logCount: 0 };
  }
}

/**
 * Delete a report document from Firestore.
 */
export async function deleteReportFromFirestore(reportId: string): Promise<boolean> {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn('[Firestore] Error deleting report:', error);
    return false;
  }
}

/**
 * Clear all reports and audit logs from Firestore.
 */
export async function clearAllFromFirestore(): Promise<{ reportsDeleted: number; logsDeleted: number }> {
  let reportsDeleted = 0;
  let logsDeleted = 0;
  try {
    const reportsRef = collection(db, REPORTS_COLLECTION);
    const repSnap = await getDocs(reportsRef);
    for (const d of repSnap.docs) {
      await deleteDoc(doc(db, REPORTS_COLLECTION, d.id));
      reportsDeleted++;
    }
  } catch (err) {
    console.warn('[Firestore] Error clearing reports:', err);
  }

  try {
    const logsRef = collection(db, AUDIT_LOGS_COLLECTION);
    const logSnap = await getDocs(logsRef);
    for (const d of logSnap.docs) {
      await deleteDoc(doc(db, AUDIT_LOGS_COLLECTION, d.id));
      logsDeleted++;
    }
  } catch (err) {
    console.warn('[Firestore] Error clearing logs:', err);
  }

  return { reportsDeleted, logsDeleted };
}
