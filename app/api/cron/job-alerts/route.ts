import { NextRequest, NextResponse } from 'next/server';
import { processJobAlerts } from '../../../../lib/jobAlerts';

// Called by Vercel Cron (configure in vercel.json) or any external scheduler.
// Protected by CRON_SECRET to prevent unauthenticated triggers.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processJobAlerts();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[cron/job-alerts]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
