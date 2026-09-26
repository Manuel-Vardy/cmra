import { NextRequest, NextResponse } from 'next/server';
import { sendBrevoEmail } from '@/lib/emailService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetEmail = searchParams.get('email') || process.env.BREVO_SENDER_EMAIL || 'manuelvardy83@gmail.com';

  const result = await sendBrevoEmail({
    toEmail: targetEmail,
    toName: 'CivicPulse Administrator',
    subject: '[CivicPulse Test] Email Notification Delivery Test',
    htmlContent: `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b;">
        <h2 style="color: #2563eb;">CivicPulse Email Notifications Active</h2>
        <p>This is a test notification confirming that Brevo transactional email delivery is configured properly.</p>
        <ul>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          <li><strong>Recipient:</strong> ${targetEmail}</li>
          <li><strong>Service:</strong> Brevo SMTP API</li>
        </ul>
      </div>
    `,
  });

  return NextResponse.json({
    status: result.success ? 'success' : 'failed',
    targetEmail,
    brevoResult: result,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetEmail = body.email || process.env.BREVO_SENDER_EMAIL || 'manuelvardy83@gmail.com';

    const result = await sendBrevoEmail({
      toEmail: targetEmail,
      toName: body.name || 'Resident',
      subject: body.subject || '[CivicPulse Test] Notification Verification',
      htmlContent: `<p>${body.message || 'Notification service test message.'}</p>`,
    });

    return NextResponse.json({
      status: result.success ? 'success' : 'failed',
      targetEmail,
      brevoResult: result,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err?.message }, { status: 500 });
  }
}
