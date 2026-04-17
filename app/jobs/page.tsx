import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JobsPageClient from './JobsPageClient'

interface JobsPageProps {
  searchParams: Promise<{
    page?: string
    q?: string
    category?: string
    location?: string
    remote?: string
    featured?: string
    sort?: string
  }>
}

export async function generateMetadata({ searchParams }: JobsPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const { q, category, location } = resolvedSearchParams

  let title = 'Job Opportunities | WorkCrew.ai'
  let description = 'Find your dream job with WorkCrew.ai. Browse thousands of job opportunities from top companies.'

  if (q) {
    title = `${q} Jobs | WorkCrew.ai`
    description = `Find ${q} job opportunities. Search and apply to jobs that match your skills.`
  }

  if (category) {
    title = `${category} Jobs | WorkCrew.ai`
    description = `Browse ${category.toLowerCase()} job opportunities from top companies.`
  }

  if (location) {
    title = `Jobs in ${location} | WorkCrew.ai`
    description = `Find job opportunities in ${location}. Local jobs and remote work options available.`
  }

  return {
    title,
    description,
    keywords: ['jobs', 'careers', 'employment', 'work', q, category, location].filter((item): item is string => Boolean(item)),
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://workcrew.ai/jobs',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://workcrew.ai/jobs',
    },
  }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  try {
    const resolvedSearchParams = await searchParams

    // Build API URL with search params
    const params = new URLSearchParams()
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs?${params.toString()}`

    // Fetch jobs data on server
    const response = await fetch(apiUrl, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error('Failed to fetch jobs')
    }

    const data = await response.json()

    return <JobsPageClient initialData={data} searchParams={resolvedSearchParams} />
  } catch (error) {
    console.error('Jobs page error:', error)
    notFound()
  }
}