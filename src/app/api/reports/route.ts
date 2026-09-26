import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, generateReportNumber, detectDuplicates, addAuditLog, addReport } from '@/lib/db';
import { IssueReport, ReportPriority, ReportStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { reports } = getDatabase();

  const query = searchParams.get('q')?.toLowerCase() || '';
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');
  const community = searchParams.get('community');
  const department = searchParams.get('department');

  let filtered = [...reports];

  if (query) {
    filtered = filtered.filter(
      (r) =>
        r.reportNumber.toLowerCase().includes(query) ||
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.reporter.fullName.toLowerCase().includes(query) ||
        r.reporter.email.toLowerCase().includes(query) ||
        r.location.address.toLowerCase().includes(query) ||
        r.location.town.toLowerCase().includes(query) ||
        (r.assignment?.officerName && r.assignment.officerName.toLowerCase().includes(query))
    );
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((r) => r.category === category);
  }

  if (priority && priority !== 'all') {
    filtered = filtered.filter((r) => r.priority === priority);
  }

  if (community && community !== 'all') {
    filtered = filtered.filter(
      (r) => r.location.community.toLowerCase() === community.toLowerCase()
    );
  }

  if (department && department !== 'all') {
    filtered = filtered.filter(
      (r) => r.assignment?.department.toLowerCase() === department.toLowerCase()
    );
  }

  // Sort latest first
  filtered.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  return NextResponse.json({
    reports: filtered,
    total: filtered.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reports } = getDatabase();

    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.reporter?.fullName) {
      return NextResponse.json(
        { error: 'Missing required fields (title, description, category, reporter details).' },
        { status: 400 }
      );
    }

    const priority: ReportPriority = body.priority || 'Medium';
    let slaTargetHours = 24;
    if (priority === 'Critical') slaTargetHours = 1;
    else if (priority === 'High') slaTargetHours = 6;
    else if (priority === 'Medium') slaTargetHours = 24;
    else if (priority === 'Low') slaTargetHours = 72;

    const lat = body.location?.latitude || 40.7128;
    const lng = body.location?.longitude || -74.006;
    const community = body.location?.community || 'Metro Central';

    // Duplicate detection
    const potentialDuplicates = detectDuplicates({
      category: body.category,
      latitude: lat,
      longitude: lng,
      community: community,
    });

    const reportNumber = generateReportNumber();
    const now = new Date().toISOString();

    const newReport: IssueReport = {
      id: 'rep-' + Date.now(),
      reportNumber,
      title: body.title,
      description: body.description,
      category: body.category,
      subCategory: body.subCategory || '',
      status: 'Submitted' as ReportStatus,
      priority,
      slaTargetHours,
      location: {
        latitude: lat,
        longitude: lng,
        address: body.location?.address || 'Reported Location',
        town: body.location?.town || 'Metro District',
        community: community,
      },
      media: body.media || [],
      reporter: {
        fullName: body.reporter.fullName,
        email: body.reporter.email || '',
        phone: body.reporter.phone || '',
        town: body.reporter.town || 'Metro District',
        community: body.reporter.community || community,
        isAnonymous: !!body.reporter.isAnonymous,
      },
      reportedAt: now,
      updatedAt: now,
      statusHistory: [
        {
          id: 'sh-' + Date.now(),
          oldStatus: 'None',
          newStatus: 'Submitted',
          changedBy: body.reporter.fullName + (body.reporter.isAnonymous ? ' (Anonymous Resident)' : ' (Citizen)'),
          role: 'resident',
          timestamp: now,
          notes: 'Report submitted via web portal',
        },
      ],
      comments: [],
      potentialDuplicates: potentialDuplicates.length > 0 ? potentialDuplicates : undefined,
    };

    await addReport(newReport);

    addAuditLog({
      reportId: newReport.id,
      reportNumber: newReport.reportNumber,
      action: 'REPORT_SUBMITTED',
      actor: body.reporter.fullName,
      role: 'Citizen Reporter',
      details: `New issue "${newReport.title}" reported under category ${newReport.category} with priority ${newReport.priority}`,
    });

    // Send confirmation email to citizen asynchronously
    import('@/lib/emailService').then(({ sendReportCreatedNotification }) => {
      sendReportCreatedNotification(newReport).catch((err) => {
        console.warn('[Brevo] Failed to send report confirmation email:', err);
      });
    });

    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
