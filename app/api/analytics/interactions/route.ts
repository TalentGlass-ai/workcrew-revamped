import { NextRequest, NextResponse } from 'next/server'

// UserInteraction model not yet in schema — interactions are logged to console until the model is added
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, action } = body

    if (!sessionId || !action) {
      return NextResponse.json({ error: 'sessionId and action are required' }, { status: 400 })
    }

    const validActions = ['view', 'apply', 'save', 'unsave', 'share', 'contact', 'recommend', 'search', 'filter']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    console.log('[analytics/interactions]', body)
    return NextResponse.json({ success: true, interactionId: crypto.randomUUID() })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ interactions: [], total: 0, limit: 100, offset: 0 })
}
