import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryJobsClient from './CategoryJobsClient'

interface CategoryJobsPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: CategoryJobsPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/category/${slug}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      return {
        title: 'Job Category | WorkCrew.ai',
      }
    }

    const data = await response.json()

    return {
      title: data.meta.title,
      description: data.meta.description,
      keywords: data.meta.keywords,
      openGraph: {
        title: data.meta.title,
        description: data.meta.description,
        type: 'website',
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/jobs/category/${slug}`,
      },
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/jobs/category/${slug}`,
      },
    }
  } catch (error) {
    return {
      title: 'Job Category | WorkCrew.ai',
    }
  }
}

export default async function CategoryJobsPage({ params, searchParams }: CategoryJobsPageProps) {
  try {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    const filteredSearchParams = Object.fromEntries(
      Object.entries(searchParamsResolved).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/category/${slug}?${new URLSearchParams(filteredSearchParams).toString()}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      notFound()
    }

    const data = await response.json()

    return <CategoryJobsClient initialData={data} searchParams={searchParamsResolved} categorySlug={slug} />
  } catch (error) {
    console.error('Category jobs page error:', error)
    notFound()
  }
}