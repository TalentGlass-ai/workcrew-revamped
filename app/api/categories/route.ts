import { NextResponse } from 'next/server'

// JobCategory model not yet in schema — categories are derived from job departments
export async function GET() {
  return NextResponse.json({ categories: [] })
}
