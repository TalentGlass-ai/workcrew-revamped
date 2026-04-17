import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JobDetailClient from './JobDetailClient'
import Script from 'next/script'
import { generateCanonicalUrl } from '../../../lib/seo'

interface JobDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/${slug}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      return {
        title: 'Job Not Found | WorkCrew.ai',
      }
    }

    const job = await response.json()

    // Generate dynamic OG image URL
    const ogImageUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/og/job?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company.name)}&location=${encodeURIComponent(job.location || 'Remote')}`

    return {
      title: job.meta.title,
      description: job.meta.description,
      keywords: job.meta.keywords,
      openGraph: {
        title: job.meta.title,
        description: job.meta.description,
        type: 'article',
        url: job.url,
        siteName: 'WorkCrew.ai',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${job.title} at ${job.company.name}`,
            type: 'image/svg+xml',
          },
        ],
        locale: 'en_US',
        publishedTime: job.createdAt,
        modifiedTime: job.updatedAt,
        authors: [job.company.name],
        tags: job.meta.keywords,
      },
      twitter: {
        card: 'summary_large_image',
        title: job.meta.title,
        description: job.meta.description,
        images: [ogImageUrl],
        creator: '@workcrewai',
        site: '@workcrewai',
      },
      other: {
        'article:author': job.company.name,
        'article:publisher': 'WorkCrew.ai',
        'article:section': job.category.name,
        'article:tag': job.meta.keywords.join(','),
        'og:site_name': 'WorkCrew.ai',
        'og:locale': 'en_US',
        'og:type': 'article',
      },
      alternates: {
        canonical: generateCanonicalUrl(`/jobs/${slug}`),
      },
    }
  } catch (error) {
    return {
      title: 'Job Details | WorkCrew.ai',
    }
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  try {
    const { slug } = await params
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/${slug}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      notFound()
    }

    const job = await response.json()

    return (
      <>
        {/* Structured Data for SEO */}
        <Script
          id="job-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(job.structuredData),
          }}
        />

        <JobDetailClient job={job} />
      </>
    )
  } catch (error) {
    console.error('Job detail page error:', error)
    notFound()
  }
}