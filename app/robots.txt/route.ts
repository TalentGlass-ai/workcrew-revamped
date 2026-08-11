import { NextResponse } from 'next/server'
import { SEO_CONFIG } from '../../lib/seo'

export function GET() {
  const { robots } = SEO_CONFIG
  const body = [
    `User-agent: ${robots.userAgent}`,
    `Allow: ${robots.allow}`,
    ...(robots.disallow as string[]).map((d) => `Disallow: ${d}`),
    `Sitemap: ${robots.sitemap}`,
  ].join('\n')
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } })
}
