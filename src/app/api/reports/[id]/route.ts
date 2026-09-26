import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, addAuditLog, updateReport, getReportByIdOrNumber, deleteReport } from '@/lib/db';
import { ReportStatus, ReportPriority } from '@/lib/types';
import { sendReportStatusUpdatedNotification } from '@/lib/emailService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getReportByIdOrNumber(id);

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json({ report });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getReportByIdOrNumber(id);
  const body = await request.json();

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const actor = body.actorName || 'Admin User';
  const role = body.actorRole || 'community_admin';

  // Handle status update
  if (body.status && body.status !== report.status) {
    const oldStatus = report.status;
    const newStatus = body.status as ReportStatus;
    report.status = newStatus;
    report.statusHistory.push({
      id: 'sh-' + Date.now(),
      oldStatus,
      newStatus,
      changedBy: actor,
      role,
      timestamp: now,
      notes: body.statusNotes || `Status changed from ${oldStatus} to ${newStatus}`,
    });

    if (newStatus === 'Resolved') {
      report.resolvedAt = now;
    }

    addAuditLog({
      reportId: report.id,
      reportNumber: report.reportNumber,
      action: 'STATUS_CHANGE',
      actor,
      role,
      details: `Status transitioned from "${oldStatus}" to "${newStatus}"`,
    });

    // Send status update notification to citizen (awaited for serverless reliability)
    try {
      await sendReportStatusUpdatedNotification(
        report,
        oldStatus,
        newStatus,
        body.statusNotes
      );
    } catch (err) {
      console.warn('[Brevo] Failed to send status notification:', err);
    }
  }

  // Handle priority update
  if (body.priority && body.priority !== report.priority) {
    const oldPriority = report.priority;
    report.priority = body.priority as ReportPriority;

    if (report.priority === 'Critical') report.slaTargetHours = 1;
    else if (report.priority === 'High') report.slaTargetHours = 6;
    else if (report.priority === 'Medium') report.slaTargetHours = 24;
    else if (report.priority === 'Low') report.slaTargetHours = 72;

    addAuditLog({
      reportId: report.id,
      reportNumber: report.reportNumber,
      action: 'PRIORITY_UPDATE',
      actor,
      role,
      details: `Priority changed from "${oldPriority}" to "${report.priority}" (SLA: ${report.slaTargetHours}h)`,
    });
  }

  // Handle assignment
  if (body.assignment) {
    report.assignment = {
      department: body.assignment.department,
      officerName: body.assignment.officerName || 'Duty Dispatcher',
      assignedBy: actor,
      assignedAt: now,
      dueDate:
        body.assignment.dueDate ||
        new Date(Date.now() + report.slaTargetHours * 3600 * 1000).toISOString(),
    };

    if (report.status === 'Submitted' || report.status === 'Under Review' || report.status === 'Verified') {
      report.status = 'Assigned';
      report.statusHistory.push({
        id: 'sh-' + Date.now(),
        oldStatus: report.status,
        newStatus: 'Assigned',
        changedBy: actor,
        role,
        timestamp: now,
        notes: `Assigned to ${report.assignment.department} (${report.assignment.officerName})`,
      });
    }

    addAuditLog({
      reportId: report.id,
      reportNumber: report.reportNumber,
      action: 'ASSIGNMENT',
      actor,
      role,
      details: `Assigned to ${report.assignment.department} - ${report.assignment.officerName}`,
    });
  }

  // Handle resolution evidence
  if (body.resolutionEvidence) {
    report.resolutionEvidence = {
      photos: body.resolutionEvidence.photos || [],
      notes: body.resolutionEvidence.notes || 'Issue resolved successfully.',
      completedAt: now,
      completedBy: actor,
    };
    report.status = 'Resolved';
    report.resolvedAt = now;

    report.statusHistory.push({
      id: 'sh-' + Date.now(),
      oldStatus: 'In Progress',
      newStatus: 'Resolved',
      changedBy: actor,
      role,
      timestamp: now,
      notes: `Resolution evidence documented: ${report.resolutionEvidence.notes}`,
    });

    addAuditLog({
      reportId: report.id,
      reportNumber: report.reportNumber,
      action: 'RESOLUTION_EVIDENCE_ATTACHED',
      actor,
      role,
      details: `Resolution evidence uploaded and case marked as Resolved`,
    });
  }

  // Handle comments/notes
  if (body.commentText) {
    report.comments.push({
      id: 'c-' + Date.now(),
      userName: actor,
      userRole: role,
      text: body.commentText,
      createdAt: now,
      isInternal: !!body.isInternal,
    });

    addAuditLog({
      reportId: report.id,
      reportNumber: report.reportNumber,
      action: 'COMMENT_ADDED',
      actor,
      role,
      details: `Added ${body.isInternal ? 'internal' : 'public'} note to case`,
    });
  }

  report.updatedAt = now;
  await updateReport(report.id, report);

  return NextResponse.json({ success: true, report });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getReportByIdOrNumber(id);

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  await deleteReport(report.id);

  return NextResponse.json({
    success: true,
    message: `Report ${report.reportNumber} has been removed.`,
  });
}
