import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const [jobs, orgs, locations] = await Promise.all([
      prisma.job.findMany({
        where: { status: 'published' },
        select: { id: true, title: true, seoSlug: true, createdAt: true, updatedAt: true }
      }),
      prisma.organization.findMany({
        select: { id: true, name: true, updatedAt: true }
      }),
      prisma.job.findMany({
        where: { status: 'published', location: { not: null } },
        select: { location: true },
        distinct: ['location']
      }),
    ])

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/jobs</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/pricing</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  ${jobs.map((job) => `<url><loc>${baseUrl}/jobs/${job.seoSlug ?? createSlug(job.title, job.id)}</loc><lastmod>${job.updatedAt.toISOString()}</lastmod><priority>0.8</priority></url>`).join('\n  ')}
  ${orgs.map((org) => `<url><loc>${baseUrl}/companies/${createSlug(org.name, org.id)}</loc><lastmod>${org.updatedAt.toISOString()}</lastmod><priority>0.7</priority></url>`).join('\n  ')}
  ${locations.filter((l) => l.location).map((l) => `<url><loc>${baseUrl}/jobs/location/${l.location!.toLowerCase().replace(/\s+/g, '-')}</loc><priority>0.8</priority></url>`).join('\n  ')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function createSlug(name: string, id: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim() + '-' + id.slice(-8)
}
