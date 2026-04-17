// SEO Configuration for WorkCrew.ai
export const SEO_CONFIG = {
  site: {
    name: 'WorkCrew.ai',
    description: 'Find your dream job with WorkCrew.ai. Discover thousands of job opportunities from top companies worldwide.',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    twitterHandle: '@workcrewai',
    ogImage: '/og-default.png',
  },

  defaultMeta: {
    title: 'Find Your Dream Job | WorkCrew.ai',
    description: 'Discover thousands of job opportunities from top companies. Search by location, category, and skills. Apply to jobs that match your career goals.',
    keywords: ['jobs', 'careers', 'employment', 'hiring', 'job search', 'remote jobs', 'tech jobs'],
    type: 'website',
    locale: 'en_US',
  },

  structuredData: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'WorkCrew.ai',
      description: 'A modern job portal connecting talented professionals with great companies worldwide.',
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      logo: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/logo.png`,
      sameAs: [
        'https://twitter.com/workcrewai',
        'https://linkedin.com/company/workcrewai',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'hello@workcrew.ai',
      },
    },

    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'WorkCrew.ai',
      description: 'Find your dream job with WorkCrew.ai',
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/jobs?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  },

  robots: {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/', '/admin/', '/_next/', '/login', '/signup', '/onboarding/'],
    sitemap: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/sitemap.xml`,
  },
}

// Helper functions for SEO
export function generateJobTitle(jobTitle: string, companyName: string): string {
  return `${jobTitle} at ${companyName} | WorkCrew.ai`
}

export function generateJobDescription(description: string, companyName: string, location?: string): string {
  const baseDesc = description.substring(0, 155).replace(/\n/g, ' ')
  const suffix = location ? ` at ${companyName} in ${location}` : ` at ${companyName}`
  return baseDesc + '...' + suffix
}

export function generateJobKeywords(job: any): string[] {
  return [
    job.title,
    job.company.name,
    job.category.name,
    job.location || 'Remote',
    job.type.replace('_', ' '),
    'jobs',
    'careers',
    'hiring',
    ...job.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || []
  ].filter(Boolean)
}

export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl}${path}`
}

export function generateJobSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}

export function generateCompanySlug(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `${slug}-${id.slice(-8)}`
}