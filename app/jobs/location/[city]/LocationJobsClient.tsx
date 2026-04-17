'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Job {
  id: string
  title: string
  description: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  type: string
  isRemote: boolean
  skills: string | null
  createdAt: string
  url: string
  companyUrl: string
  company: {
    id: string
    name: string
    logo: string | null
  }
  category: {
    id: string
    name: string
  }
}

interface CategoryCount {
  category: {
    id: string
    name: string
  }
  _count: {
    jobs: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

interface LocationJobsData {
  jobs: Job[]
  pagination: Pagination
  cityName: string
  categoryCounts: CategoryCount[]
  meta: {
    title: string
    description: string
    keywords: string[]
  }
}

interface LocationJobsClientProps {
  initialData: LocationJobsData
  searchParams: Record<string, string | undefined>
  citySlug: string
}

export default function LocationJobsClient({ initialData, searchParams, citySlug }: LocationJobsClientProps) {
  const [data, setData] = useState<LocationJobsData>(initialData)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '')

  const updateFilters = async (category: string = '') => {
    setLoading(true)
    setSelectedCategory(category)

    const params = new URLSearchParams()
    if (category) params.set('category', category)

    try {
      const response = await fetch(`/api/jobs/location/${citySlug}?${params.toString()}`)
      const newData = await response.json()
      setData(newData)

      // Update URL without page reload
      const newUrl = `/jobs/location/${citySlug}${params.toString() ? `?${params.toString()}` : ''}`
      window.history.replaceState({}, '', newUrl)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Jobs in {data.cityName}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover {data.pagination.total.toLocaleString()} job opportunities in {data.cityName}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => updateFilters('')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories ({data.categoryCounts.reduce((sum, cat) => sum + cat._count.jobs, 0)})
            </button>

            {data.categoryCounts.slice(0, 8).map((categoryCount) => (
              <button
                key={categoryCount.category.id}
                onClick={() => updateFilters(categoryCount.category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === categoryCount.category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryCount.category.name} ({categoryCount._count.jobs})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory ? `${selectedCategory} Jobs` : 'All Jobs'} in {data.cityName}
          </h2>
          <span className="text-gray-600">
            {data.pagination.total} jobs found
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="flex justify-center space-x-2">
                {data.pagination.hasPrev && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams()
                      if (selectedCategory) params.set('category', selectedCategory)
                      params.set('page', (data.pagination.page - 1).toString())
                      updateFilters(selectedCategory)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}

                {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        const params = new URLSearchParams()
                        if (selectedCategory) params.set('category', selectedCategory)
                        params.set('page', pageNum.toString())
                        updateFilters(selectedCategory)
                      }}
                      className={`px-4 py-2 border rounded-md ${
                        pageNum === data.pagination.page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                {data.pagination.hasNext && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams()
                      if (selectedCategory) params.set('category', selectedCategory)
                      params.set('page', (data.pagination.page + 1).toString())
                      updateFilters(selectedCategory)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Next
                  </button>
                )}
              </div>
            )}

            {/* No jobs found */}
            {data.jobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any {selectedCategory ? `${selectedCategory.toLowerCase()} ` : ''}jobs in {data.cityName} matching your criteria.
                </p>
                <div className="space-x-4">
                  <button
                    onClick={() => updateFilters('')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    View All Jobs
                  </button>
                  <Link
                    href="/jobs"
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200"
                  >
                    Browse All Locations
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={job.url} className="block">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                {job.title}
              </h3>
            </Link>
            <Link href={job.companyUrl} className="text-sm text-gray-600 hover:text-blue-600">
              {job.company.name}
            </Link>
          </div>
          {job.company.logo && (
            <Image
              src={job.company.logo}
              alt={job.company.name}
              width={48}
              height={48}
              className="rounded-lg ml-4"
            />
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-4">📍 {job.location || 'Remote'}</span>
            <span className="mr-4">💼 {job.type.replace('_', ' ')}</span>
          </div>

          {job.salaryMin && job.salaryMax && (
            <div className="text-sm text-green-600 font-medium">
              💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
            </div>
          )}

          {job.skills && (
            <div className="flex flex-wrap gap-1">
              {job.skills.split(',').slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
          <Link
            href={job.url}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}