import { NextRequest, NextResponse } from 'next/server'

// SavedSearch model not yet in schema
export async function GET() {
  return NextResponse.json({ savedSearches: [] })
}

export async function POST() {
  return NextResponse.json({ error: 'Saved searches not yet implemented' }, { status: 501 })
}
