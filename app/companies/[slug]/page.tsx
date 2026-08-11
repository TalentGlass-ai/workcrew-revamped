import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CompanyDetailClient from './CompanyDetailClient'
import Script from 'next/script'

interface CompanyPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  try {
    const { slug } = await params

    // Extract company ID from slug (format: "company-name-12345678")
    const companyId = extractCompanyIdFromSlug(slug)

    if (!companyId) {
      return {
        title: 'Company Not Found | WorkCrew.ai',
      }
    }

    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/companies/${companyId}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      return {
        title: 'Company Not Found | WorkCrew.ai',
      }
    }

    const company = await response.json()

    return {
      title: `${company.name} Jobs & Company Profile | WorkCrew.ai`,
      description: company.description || `${company.name} is hiring. View all ${company.name} jobs and company information.`,
      keywords: [company.name, 'jobs', 'careers', company.industry, company.location].filter(Boolean),
      openGraph: {
        title: `${company.name} Jobs & Company Profile | WorkCrew.ai`,
        description: company.description || `${company.name} is hiring. View all ${company.name} jobs and company information.`,
        type: 'website',
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/companies/${slug}`,
        images: company.logo ? [
          {
            url: company.logo,
            width: 400,
            height: 400,
            alt: company.name,
          },
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${company.name} Jobs & Company Profile | WorkCrew.ai`,
        description: company.description || `${company.name} is hiring. View all ${company.name} jobs and company information.`,
        images: company.logo ? [company.logo] : [],
      },
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/companies/${slug}`,
      },
    }
  } catch (error) {
    return {
      title: 'Company Profile | WorkCrew.ai',
    }
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  try {
    const { slug } = await params

    // Extract company ID from slug
    const companyId = extractCompanyIdFromSlug(slug)

    if (!companyId) {
      notFound()
    }

    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/companies/${companyId}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    })

    if (!response.ok) {
      notFound()
    }

    const company = await response.json()

    return (
      <>
        {/* Organization Structured Data */}
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationStructuredData(company, `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/companies/${slug}`)),
          }}
        />

        <CompanyDetailClient company={company} />
      </>
    )
  } catch (error) {
    console.error('Company page error:', error)
    notFound()
  }
}

function extractCompanyIdFromSlug(slug: string): string | null {
  // Slug format: "company-name-abcd1234" where last segment is final 8 chars of UUID
  const parts = slug.split('-')
  const last = parts[parts.length - 1]
  return last.length === 8 ? last : null
}

function generateOrganizationStructuredData(company: any, companyUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': companyUrl + '#Organization',
    name: company.name,
    description: company.description,
    url: company.website,
    logo: company.logo ? {
      '@type': 'ImageObject',
      url: company.logo,
      width: 200,
      height: 200
    } : undefined,
    foundingDate: company.foundedYear,
    numberOfEmployees: company.size ? {
      '@type': 'QuantitativeValue',
      value: parseInt(company.size.split('-')[0]) || 1
    } : undefined,
    industry: company.industry,
    address: company.location ? {
      '@type': 'PostalAddress',
      addressLocality: company.location,
      addressCountry: 'US'
    } : undefined,
    sameAs: company.website,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${company.name} Job Opportunities`,
      itemListElement: company.jobs?.map((job: any, index: number) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'JobPosting',
          title: job.title,
          url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/jobs/${job.slug}`,
          datePosted: job.createdAt,
          employmentType: job.type,
          jobLocation: job.location ? {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location
            }
          } : undefined
        }
      })) || []
    }
  }
}