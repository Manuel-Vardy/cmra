import { NextResponse } from 'next/server';
import { getAllAuditLogs } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auditLogs = await getAllAuditLogs();
  return NextResponse.json({ auditLogs });
}
