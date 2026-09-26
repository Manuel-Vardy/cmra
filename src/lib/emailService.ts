import { IssueReport } from './types';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
// API key must be set via BREVO_API_KEY environment variable in .env.local
const DEFAULT_API_KEY = '';

interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

/**
 * Sends a transactional email via Brevo SMTP API.
 */
export async function sendBrevoEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY || DEFAULT_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'manuelvardy83@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'CivicPulse Community Portal';

  if (!apiKey) {
    console.warn('[Brevo] No API key configured. Email skipped.');
    return { success: false, error: 'No Brevo API key' };
  }

  if (!toEmail || !toEmail.includes('@')) {
    console.warn('[Brevo] Invalid recipient email:', toEmail);
    return { success: false, error: 'Invalid recipient email' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail.trim(),
            name: toName?.trim() || 'Citizen Resident',
          },
        ],
        subject,
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Brevo Error]', response.status, data);
      return { success: false, error: data?.message || 'Failed to send via Brevo' };
    }

    console.log(`[Brevo Success] Sent email "${subject}" to ${toEmail} (ID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error('[Brevo Exception]', error);
    return { success: false, error: error?.message || 'Network error' };
  }
}

/**
 * Helper to get the public base URL for track links.
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return 'http://localhost:3000';
}

/**
 * Send email when a resident successfully submits a report.
 */
export async function sendReportCreatedNotification(report: IssueReport) {
  const reporterEmail = report.reporter?.email;
  if (!reporterEmail) return;

  const appUrl = getBaseUrl();
  const trackUrl = `${appUrl}/?track=${encodeURIComponent(report.reportNumber)}`;

  const subject = `[CivicPulse] Report Received: ${report.reportNumber} - ${report.title}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #1e3a8a, #2563eb, #06b6d4); padding: 32px 28px; color: #ffffff; text-align: center; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
    .title { font-size: 24px; font-weight: 800; margin: 0; }
    .body { padding: 32px 28px; }
    .tracking-box { background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .tracking-code { font-family: monospace; font-size: 22px; font-weight: 800; color: #1d4ed8; letter-spacing: 1px; }
    .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
    .info-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .info-label { color: #64748b; font-weight: 600; width: 35%; }
    .info-value { color: #0f172a; font-weight: 700; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 24px; text-align: center; }
    .footer { background: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Official Confirmation</div>
      <h1 class="title">CivicPulse Resident Portal</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Your community problem has been registered into the dispatch queue.</p>
    </div>

    <div class="body">
      <p style="font-size: 16px; margin-top: 0;">Hello <strong>${report.reporter.fullName || 'Resident'}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Thank you for helping keep our community safe and clean. Your civic issue report has been logged and assigned an official municipal tracking ID.
      </p>

      <div class="tracking-box">
        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Your Tracking Number</div>
        <div class="tracking-code">${report.reportNumber}</div>
        <div style="font-size: 12px; color: #3b82f6; margin-top: 6px;">Save this code to check real-time progress anytime</div>
      </div>

      <table class="info-table">
        <tr>
          <td class="info-label">Issue Title:</td>
          <td class="info-value">${report.title}</td>
        </tr>
        <tr>
          <td class="info-label">Category:</td>
          <td class="info-value">${report.category} ${report.subCategory ? `• ${report.subCategory}` : ''}</td>
        </tr>
        <tr>
          <td class="info-label">Location:</td>
          <td class="info-value">${report.location.address}, ${report.location.community}</td>
        </tr>
        <tr>
          <td class="info-label">Priority:</td>
          <td class="info-value">${report.priority}</td>
        </tr>
        <tr>
          <td class="info-label">Target SLA:</td>
          <td class="info-value">${report.slaTargetHours} Hours</td>
        </tr>
        <tr>
          <td class="info-label">Initial Status:</td>
          <td class="info-value" style="color: #2563eb;">Submitted (Pending Review)</td>
        </tr>
      </table>

      <div style="text-align: center;">
        <a href="${trackUrl}" class="btn">Track Case Online →</a>
      </div>
    </div>

    <div class="footer">
      CivicPulse Community Management & Resolution Platform<br>
      You received this email because you submitted an issue report at our community portal.
    </div>
  </div>
</body>
</html>
  `;

  return sendBrevoEmail({
    toEmail: reporterEmail,
    toName: report.reporter.fullName || 'Resident',
    subject,
    htmlContent,
  });
}

/**
 * Send email when report status or assignment is updated.
 */
export async function sendReportStatusUpdatedNotification(
  report: IssueReport,
  oldStatus: string,
  newStatus: string,
  notes?: string
) {
  const reporterEmail = report.reporter?.email;
  if (!reporterEmail) return;

  const appUrl = getBaseUrl();
  const trackUrl = `${appUrl}/?track=${encodeURIComponent(report.reportNumber)}`;

  // If status is resolved, use the specialized resolved email
  if (newStatus === 'Resolved' || newStatus === 'Closed') {
    return sendReportResolvedNotification(report);
  }

  const subject = `[CivicPulse Update] Status: ${newStatus} (${report.reportNumber})`;

  const statusColorMap: Record<string, string> = {
    'Under Review': '#d97706',
    Verified: '#2563eb',
    Assigned: '#7c3aed',
    'In Progress': '#0284c7',
    Rejected: '#dc2626',
  };
  const badgeColor = statusColorMap[newStatus] || '#2563eb';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #1e293b; padding: 28px; color: #ffffff; text-align: center; }
    .status-badge { display: inline-block; background: ${badgeColor}; color: #ffffff; padding: 6px 16px; border-radius: 9999px; font-size: 14px; font-weight: bold; margin-top: 10px; }
    .body { padding: 32px 28px; }
    .note-box { background: #f8fafc; border-left: 4px solid ${badgeColor}; padding: 16px; border-radius: 0 10px 10px 0; margin: 20px 0; font-size: 14px; color: #334155; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 24px; text-align: center; }
    .footer { background: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size: 12px; text-transform: uppercase; font-weight: bold; opacity: 0.8; letter-spacing: 0.05em;">Case Status Transition</div>
      <h2 style="margin: 6px 0 0 0; font-size: 20px;">Report #${report.reportNumber}</h2>
      <div class="status-badge">${newStatus}</div>
    </div>

    <div class="body">
      <p style="font-size: 15px; margin-top: 0;">Hello <strong>${report.reporter.fullName || 'Resident'}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        There has been an update regarding your civic issue: <strong>"${report.title}"</strong>.
      </p>

      <div style="background: #f1f5f9; padding: 14px; border-radius: 10px; font-size: 13px; margin: 16px 0;">
        <div><strong>Previous Status:</strong> ${oldStatus}</div>
        <div style="margin-top: 6px;"><strong>Updated Status:</strong> <span style="color: ${badgeColor}; font-weight: bold;">${newStatus}</span></div>
        ${
          report.assignment?.department
            ? `<div style="margin-top: 6px;"><strong>Assigned Unit:</strong> ${report.assignment.department} (Officer: ${report.assignment.officerName})</div>`
            : ''
        }
      </div>

      ${
        notes
          ? `<div class="note-box"><strong>Officer / Admin Note:</strong><br>${notes}</div>`
          : ''
      }

      <div style="text-align: center;">
        <a href="${trackUrl}" class="btn">View Live Progress →</a>
      </div>
    </div>

    <div class="footer">
      CivicPulse Community Management Platform • Automated System Notification
    </div>
  </div>
</body>
</html>
  `;

  return sendBrevoEmail({
    toEmail: reporterEmail,
    toName: report.reporter.fullName || 'Resident',
    subject,
    htmlContent,
  });
}

/**
 * Send email when report is successfully resolved.
 */
export async function sendReportResolvedNotification(report: IssueReport) {
  const reporterEmail = report.reporter?.email;
  if (!reporterEmail) return;

  const appUrl = getBaseUrl();
  const trackUrl = `${appUrl}/?track=${encodeURIComponent(report.reportNumber)}`;

  const subject = `[CivicPulse Resolved] Problem Resolved: ${report.reportNumber} - ${report.title}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #059669, #10b981); padding: 32px 28px; color: #ffffff; text-align: center; }
    .badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 4px 14px; border-radius: 9999px; font-size: 13px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
    .body { padding: 32px 28px; }
    .evidence-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 20px; text-align: center; }
    .footer { background: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Case Closed & Verified</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Issue Successfully Resolved!</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 14px;">Case #${report.reportNumber}</p>
    </div>

    <div class="body">
      <p style="font-size: 16px; margin-top: 0;">Hello <strong>${report.reporter.fullName || 'Resident'}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Good news! The municipal field team has completed the necessary repairs and maintenance for your reported issue: <strong>"${report.title}"</strong>.
      </p>

      <div class="evidence-box">
        <div style="font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase;">Resolution Summary</div>
        <p style="font-size: 14px; color: #15803d; margin: 6px 0 0 0; line-height: 1.5;">
          ${report.resolutionEvidence?.notes || 'Municipal operations signed off on the completed work. The site has been inspected and cleared.'}
        </p>
        ${
          report.resolutionEvidence?.completedBy
            ? `<div style="font-size: 12px; color: #166534; margin-top: 8px;"><strong>Signed off by:</strong> ${report.resolutionEvidence.completedBy}</div>`
            : ''
        }
      </div>

      <p style="font-size: 14px; color: #475569;">
        Please take a moment to review the completion details and rate your satisfaction with the resolution.
      </p>

      <div style="text-align: center;">
        <a href="${trackUrl}" class="btn">View Resolution Proof & Leave Feedback →</a>
      </div>
    </div>

    <div class="footer">
      Thank you for making our municipality better and safer for everyone.<br>
      CivicPulse Community Management Platform
    </div>
  </div>
</body>
</html>
  `;

  return sendBrevoEmail({
    toEmail: reporterEmail,
    toName: report.reporter.fullName || 'Resident',
    subject,
    htmlContent,
  });
}
