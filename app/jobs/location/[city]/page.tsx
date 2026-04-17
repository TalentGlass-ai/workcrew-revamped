import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocationJobsClient from './LocationJobsClient'

interface LocationJobsPageProps {
  params: Promise<{
    city: string
  }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: LocationJobsPageProps): Promise<Metadata> {
  const { city } = await params
  const cityName = decodeURIComponent(city).replace(/-/g, ' ')

  try {
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/location/${city}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      return {
        title: `Jobs in ${cityName} | WorkCrew.ai`,
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
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/jobs/location/${city}`,
      },
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/jobs/location/${city}`,
      },
    }
  } catch (error) {
    return {
      title: `Jobs in ${cityName} | WorkCrew.ai`,
    }
  }
}

export default async function LocationJobsPage({ params, searchParams }: LocationJobsPageProps) {
  try {
    const { city } = await params
    const searchParamsResolved = await searchParams
    const filteredSearchParams = Object.fromEntries(
      Object.entries(searchParamsResolved).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/location/${city}?${new URLSearchParams(filteredSearchParams).toString()}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      notFound()
    }

    const data = await response.json()

    return <LocationJobsClient initialData={data} searchParams={searchParamsResolved} citySlug={city} />
  } catch (error) {
    console.error('Location jobs page error:', error)
    notFound()
  }
}