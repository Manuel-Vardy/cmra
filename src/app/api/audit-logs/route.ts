import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  const { auditLogs } = getDatabase();
  return NextResponse.json({ auditLogs });
}
