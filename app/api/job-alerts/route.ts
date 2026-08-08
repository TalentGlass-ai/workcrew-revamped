import { NextRequest, NextResponse } from 'next/server'

// JobAlert model not yet in schema
export async function GET() {
  return NextResponse.json({ jobAlerts: [] })
}

export async function POST() {
  return NextResponse.json({ error: 'Job alerts not yet implemented' }, { status: 501 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Job alerts not yet implemented' }, { status: 501 })
}
