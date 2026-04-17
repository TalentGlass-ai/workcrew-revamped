'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import InstantSearch from '@/workcrew-ui/components/InstantSearch'

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
    location: string | null
    size: string | null
  }
  category: {
    id: string
    name: string
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

interface JobsData {
  jobs: Job[]
  pagination: Pagination
  filters: any
}

interface JobsPageClientProps {
  initialData: JobsData
  searchParams: Record<string, string | undefined>
}

export default function JobsPageClient({ initialData, searchParams }: JobsPageClientProps) {
  const [data, setData] = useState<JobsData>(initialData)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    q: searchParams.q || '',
    category: searchParams.category || '',
    location: searchParams.location || '',
    remote: searchParams.remote === 'true',
    featured: searchParams.featured === 'true',
    sort: searchParams.sort || 'newest',
    page: searchParams.page || '1',
  })

  const updateFilters = async (newFilters: Partial<typeof filters>) => {
    setLoading(true)
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    // Build query string
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString())
      }
    })

    try {
      // Try Typesense search first
      const typesenseResponse = await fetch('/api/jobs/search-typesense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: updatedFilters.q,
          location: updatedFilters.location,
          category: updatedFilters.category ? [updatedFilters.category] : [],
          isRemote: updatedFilters.remote,
          page: parseInt(updatedFilters.page),
          limit: 12,
          sort: updatedFilters.sort === 'newest' ? 'createdAt:desc' : 'createdAt:desc', // Add more sort options later
        }),
      })

      if (typesenseResponse.ok) {
        const typesenseData = await typesenseResponse.json()
        setData({
          jobs: typesenseData.jobs || [],
          pagination: {
            page: typesenseData.page || 1,
            limit: typesenseData.limit || 12,
            total: typesenseData.total || 0,
            pages: Math.ceil((typesenseData.total || 0) / 12),
            hasNext: typesenseData.hasMore || false,
            hasPrev: (typesenseData.page || 1) > 1,
          },
          filters: updatedFilters,
        })
        return
      }

      // Fallback to basic API search
      console.log('Typesense not available, falling back to basic search')
      const fallbackResponse = await fetch(`/api/jobs?${params.toString()}`)
      const fallbackData = await fallbackResponse.json()
      setData(fallbackData)

      // Update URL without page reload
      const newUrl = `/jobs?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    updateFilters({ ...filters, page: page.toString() })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover {data.pagination.total.toLocaleString()} job opportunities from top companies
            </p>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <InstantSearch
            onSearch={(query, location) => {
              updateFilters({
                q: query,
                location: location || '',
                page: '1' // Reset to first page on new search
              })
            }}
            placeholder="Search jobs, companies, skills..."
            className="mb-6"
          />

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Software Development">Software Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <label className="flex items-center self-end">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={(e) => updateFilters({ remote: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Remote only</span>
            </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => updateFilters({ featured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured jobs</span>
              </label>

              <select
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="newest">Newest First</option>
                <option value="featured">Featured First</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {data.pagination.total} Jobs Found
          </h2>
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
                    onClick={() => handlePageChange(data.pagination.page - 1)}
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
                      onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Next
                  </button>
                )}
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