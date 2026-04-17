import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Get all active jobs
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Get all active companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    })

    // Get all job categories
    const categories = await prisma.jobCategory.findMany({
      select: {
        id: true,
        name: true,
      }
    })

    // Get popular locations (cities with jobs)
    const locations = await prisma.job.findMany({
      where: { isActive: true, location: { not: null } },
      select: { location: true },
      distinct: ['location']
    })

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}/jobs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Job Detail Pages -->
  ${jobs.map((job: any) => {
    const slug = createJobSlug(job.title, job.id)
    const lastmod = new Date(Math.max(
      new Date(job.createdAt).getTime(),
      new Date(job.updatedAt).getTime()
    )).toISOString()

    return `  <url>
    <loc>${baseUrl}/jobs/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).join('\n')}

  <!-- Company Pages -->
  ${companies.map((company: any) => {
    const slug = createCompanySlug(company.name, company.id)

    return `  <url>
    <loc>${baseUrl}/companies/${slug}</loc>
    <lastmod>${company.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  }).join('\n')}

  <!-- Category Pages -->
  ${categories.map((category: any) => {
    const slug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    return `  <url>
    <loc>${baseUrl}/jobs/category/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).join('\n')}

  <!-- Location Pages -->
  ${locations.map((location: any) => {
    if (!location.location) return ''
    const citySlug = location.location.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    return `  <url>
    <loc>${baseUrl}/jobs/location/${citySlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).filter(Boolean).join('\n')}

</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createJobSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}

function createCompanySlug(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}