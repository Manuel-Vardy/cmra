import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, addAuditLog } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { reports } = getDatabase();
  const body = await request.json();

  const report = reports.find(
    (r) => r.id === id || r.reportNumber.toLowerCase() === id.toLowerCase()
  );

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  report.feedback = {
    satisfied: !!body.satisfied,
    rating: Number(body.rating) || 5,
    comments: body.comments || '',
    submittedAt: new Date().toISOString(),
  };

  addAuditLog({
    reportId: report.id,
    reportNumber: report.reportNumber,
    action: 'CITIZEN_FEEDBACK_RECEIVED',
    actor: report.reporter.fullName,
    role: 'Resident',
    details: `Citizen submitted feedback: ${body.satisfied ? 'Satisfied' : 'Unsatisfied'} (${body.rating}/5 stars) - "${body.comments || 'No comment'}"`,
  });

  return NextResponse.json({ success: true, feedback: report.feedback });
}
