import { NextRequest, NextResponse } from 'next/server';
import { getReportByIdOrNumber, updateReport, addAuditLog } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getReportByIdOrNumber(id);
  const body = await request.json();

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const feedback = {
    satisfied: !!body.satisfied,
    rating: Number(body.rating) || 5,
    comments: body.comments || '',
    submittedAt: new Date().toISOString(),
  };

  report.feedback = feedback;
  await updateReport(report.id, { feedback });

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
