import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Job Opportunity'
    const company = searchParams.get('company') || 'Company'
    const location = searchParams.get('location') || 'Remote'

    // For now, return a simple SVG. In production, you'd use a library like @vercel/og
    // or puppeteer to generate actual images
    const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#grad1)"/>

      <!-- Content -->
      <text x="60" y="120" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
        ${escapeXml(title)}
      </text>

      <text x="60" y="180" font-family="Arial, sans-serif" font-size="32" fill="#e0e0e0">
        at ${escapeXml(company)}
      </text>

      <text x="60" y="240" font-family="Arial, sans-serif" font-size="24" fill="#cccccc">
        📍 ${escapeXml(location)}
      </text>

      <!-- WorkCrew.ai branding -->
      <text x="60" y="580" font-family="Arial, sans-serif" font-size="20" fill="#ffffff" opacity="0.8">
        WorkCrew.ai - Find Your Dream Job
      </text>
    </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400' // Cache for 24 hours
      }
    })
  } catch (error) {
    console.error('OG image generation error:', error)

    // Return a fallback SVG
    const fallbackSvg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#667eea"/>
      <text x="60" y="315" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="start" dominant-baseline="middle">
        Job Opportunity
      </text>
      <text x="60" y="580" font-family="Arial, sans-serif" font-size="20" fill="#ffffff" opacity="0.8">
        WorkCrew.ai
      </text>
    </svg>
    `

    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&#39;'
      case '"': return '&quot;'
      default: return c
    }
  })
}