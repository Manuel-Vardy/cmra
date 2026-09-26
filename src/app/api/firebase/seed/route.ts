import { NextResponse } from 'next/server';
import { INITIAL_REPORTS, INITIAL_AUDIT_LOGS } from '@/lib/db';
import { seedFirestoreIfEmpty, fetchReportsFromFirestore } from '@/lib/firestoreService';
import { firebaseConfig } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const seedResult = await seedFirestoreIfEmpty(INITIAL_REPORTS, INITIAL_AUDIT_LOGS);
    const currentReports = await fetchReportsFromFirestore();

    return NextResponse.json({
      status: 'connected',
      projectId: firebaseConfig.projectId,
      seedResult,
      activeReportsInFirestore: currentReports.length,
      sampleReportNumbers: currentReports.map((r) => r.reportNumber),
      message: 'Firestore connection and synchronization active.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        projectId: firebaseConfig.projectId,
        error: error?.message || 'Failed to connect to Firestore',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
