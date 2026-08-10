import Typesense, { FieldType } from 'typesense'

export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: 2,
})

// Check if Typesense is available
export async function isTypesenseAvailable(): Promise<boolean> {
  try {
    await typesenseClient.health.retrieve()
    return true
  } catch (error) {
    return false
  }
}

// Helper functions
function extractCity(location: string | null): string {
  if (!location) return ''
  const parts = location.split(',').map(p => p.trim())
  return parts[0] || ''
}

function extractState(location: string | null): string {
  if (!location) return ''
  const parts = location.split(',').map(p => p.trim())
  return parts[1] || ''
}

// Job schema for Typesense
export const jobSchema = {
  name: 'jobs',
  fields: [
    { name: 'id', type: 'string' as FieldType },
    { name: 'title', type: 'string' as FieldType, facet: false },
    { name: 'description', type: 'string' as FieldType, facet: false },
    { name: 'companyName', type: 'string' as FieldType, facet: true },
    { name: 'companyId', type: 'string' as FieldType, facet: true },
    { name: 'location', type: 'string' as FieldType, facet: true },
    { name: 'city', type: 'string' as FieldType, facet: true },
    { name: 'state', type: 'string' as FieldType, facet: true },
    { name: 'country', type: 'string' as FieldType, facet: true },
    { name: 'type', type: 'string' as FieldType, facet: true },
    { name: 'isRemote', type: 'bool' as FieldType, facet: true },
    { name: 'salaryMin', type: 'float' as FieldType, facet: false },
    { name: 'salaryMax', type: 'float' as FieldType, facet: false },
    { name: 'categoryName', type: 'string' as FieldType, facet: true },
    { name: 'categoryId', type: 'string' as FieldType, facet: true },
    { name: 'skills', type: 'string[]' as FieldType, facet: true },
    { name: 'benefits', type: 'string[]' as FieldType, facet: true },
    { name: 'experienceLevel', type: 'string' as FieldType, facet: true },
    { name: 'isActive', type: 'bool' as FieldType, facet: false },
    { name: 'isFeatured', type: 'bool' as FieldType, facet: true },
    { name: 'createdAt', type: 'int64' as FieldType, facet: false, sort: true },
    { name: 'updatedAt', type: 'int64' as FieldType, facet: false, sort: true },
    { name: 'latitude', type: 'float' as FieldType, facet: false },
    { name: 'longitude', type: 'float' as FieldType, facet: false },
  ],
  default_sorting_field: 'createdAt',
}

// Company schema for Typesense
export const companySchema = {
  name: 'companies',
  fields: [
    { name: 'id', type: 'string' as FieldType },
    { name: 'name', type: 'string' as FieldType, facet: false },
    { name: 'description', type: 'string' as FieldType, facet: false },
    { name: 'website', type: 'string' as FieldType, facet: false },
    { name: 'location', type: 'string' as FieldType, facet: true },
    { name: 'size', type: 'string' as FieldType, facet: true },
    { name: 'industry', type: 'string' as FieldType, facet: true },
    { name: 'logo', type: 'string' as FieldType, facet: false },
    { name: 'isActive', type: 'bool' as FieldType, facet: false },
    { name: 'createdAt', type: 'int64' as FieldType, facet: false, sort: true },
    { name: 'jobCount', type: 'int32' as FieldType, facet: false, sort: true },
  ],
  default_sorting_field: 'createdAt',
}

// Initialize collections
export async function initializeCollections() {
  try {
    // Create jobs collection
    try {
      await typesenseClient.collections('jobs').retrieve()
    } catch (error) {
      await typesenseClient.collections().create(jobSchema)
    }

    // Create companies collection
    try {
      await typesenseClient.collections('companies').retrieve()
    } catch (error) {
      await typesenseClient.collections().create(companySchema)
    }

    console.log('Typesense collections initialized successfully')
  } catch (error) {
    console.error('Error initializing Typesense collections:', error)
  }
}

// Sync job to Typesense
export async function syncJobToTypesense(job: any) {
  try {
    const document = {
      id: job.id,
      title: job.title,
      description: job.description,
      companyName: job.company?.name || '',
      companyId: job.company?.id || '',
      location: job.location || '',
      city: extractCity(job.location),
      state: extractState(job.location),
      country: 'India', // Default for now
      type: job.type || 'Full-time',
      isRemote: job.isRemote || false,
      salaryMin: job.salaryMin || 0,
      salaryMax: job.salaryMax || 0,
      categoryName: job.category?.name || '',
      categoryId: job.category?.id || '',
      skills: job.skills ? (Array.isArray(job.skills) ? job.skills : job.skills.split(',').map((s: string) => s.trim())) : [],
      benefits: job.benefits ? (Array.isArray(job.benefits) ? job.benefits : job.benefits.split(',').map((s: string) => s.trim())) : [],
      experienceLevel: job.experienceLevel || 'Entry Level',
      isActive: job.isActive,
      isFeatured: job.isFeatured || false,
      createdAt: new Date(job.createdAt).getTime(),
      updatedAt: new Date(job.updatedAt).getTime(),
      latitude: job.latitude || null,
      longitude: job.longitude || null,
    }

    await typesenseClient.collections('jobs').documents().upsert(document)
  } catch (error) {
    console.error('Error syncing job to Typesense:', error)
  }
}

// Sync company to Typesense
export async function syncCompanyToTypesense(company: any) {
  try {
    const jobCount = await typesenseClient.collections('jobs').documents().search({
      q: '*',
      filter_by: `companyId:=${company.id}`,
      per_page: 0,
    })

    const document = {
      id: company.id,
      name: company.name,
      description: company.description || '',
      website: company.website || '',
      location: company.location || '',
      size: company.size || '',
      industry: company.industry || '',
      logo: company.logo || '',
      isActive: company.isActive,
      createdAt: new Date(company.createdAt).getTime(),
      jobCount: jobCount.found,
    }

    await typesenseClient.collections('companies').documents().upsert(document)
  } catch (error) {
    console.error('Error syncing company to Typesense:', error)
  }
}

// Trigger indexing for a job (call this when job is created/updated)
export async function indexJob(jobId: string): Promise<void> {
  try {
    const isAvailable = await isTypesenseAvailable()
    if (!isAvailable) {
      console.log('Typesense not available, skipping indexing')
      return
    }

    // Call the sync API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/sync-typesense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'job',
        id: jobId,
      }),
    })

    if (!response.ok) {
      console.error('Failed to index job:', await response.text())
    }
  } catch (error) {
    console.error('Error indexing job:', error)
  }
}

// Trigger indexing for a company
export async function indexCompany(companyId: string): Promise<void> {
  try {
    const isAvailable = await isTypesenseAvailable()
    if (!isAvailable) {
      console.log('Typesense not available, skipping indexing')
      return
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/sync-typesense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'company',
        id: companyId,
      }),
    })

    if (!response.ok) {
      console.error('Failed to index company:', await response.text())
    }
  } catch (error) {
    console.error('Error indexing company:', error)
  }
}

// Search jobs with Typesense
export async function searchJobs(params: {
  q?: string
  location?: string
  category?: string
  type?: string
  isRemote?: boolean
  salaryMin?: number
  salaryMax?: number
  latitude?: number
  longitude?: number
  radius?: number
  page?: number
  limit?: number
  sort?: string
}) {
  try {
    const {
      q = '*',
      location,
      category,
      type,
      isRemote,
      salaryMin,
      salaryMax,
      latitude,
      longitude,
      radius = 50,
      page = 1,
      limit = 10,
      sort = 'createdAt:desc',
    } = params

    const filterConditions = ['isActive:=true']

    if (location) {
      filterConditions.push(`location:${location}`)
    }

    if (category) {
      filterConditions.push(`categoryName:${category}`)
    }

    if (type) {
      filterConditions.push(`type:${type}`)
    }

    if (isRemote !== undefined) {
      filterConditions.push(`isRemote:${isRemote}`)
    }

    if (salaryMin !== undefined) {
      filterConditions.push(`salaryMax:>=${salaryMin}`)
    }

    if (salaryMax !== undefined) {
      filterConditions.push(`salaryMin:<=${salaryMax}`)
    }

    // Location-based filtering (simplified - would need proper geo implementation)
    if (latitude && longitude) {
      // This is a simplified version - Typesense has geo features but requires proper setup
      filterConditions.push(`latitude:[${latitude - 0.5},${latitude + 0.5}]`)
      filterConditions.push(`longitude:[${longitude - 0.5},${longitude + 0.5}]`)
    }

    const searchParams = {
      q,
      query_by: 'title,description,companyName,skills,categoryName',
      filter_by: filterConditions.join(' && '),
      sort_by: sort,
      page,
      per_page: limit,
      include_fields: 'id,title,description,companyName,location,type,isRemote,salaryMin,salaryMax,categoryName,skills,createdAt',
    }

    const result = await typesenseClient.collections('jobs').documents().search(searchParams)

    return {
      jobs: result.hits?.map(hit => hit.document) || [],
      total: result.found,
      page: result.page,
      totalPages: Math.ceil(result.found / limit),
    }
  } catch (error) {
    console.error('Error searching jobs with Typesense:', error)
    throw error
  }
}