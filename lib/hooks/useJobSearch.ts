import { useState, useEffect } from 'react'
import type { Job } from '@/types/index'

interface SearchFilters {
  query?: string
  location?: string
  category?: string[]
  type?: string[]
  cities?: string[]
  skills?: string[]
  salaryRange?: string[]
  experienceLevel?: string[]
  isRemote?: boolean
  page?: number
  limit?: number
}

interface SearchResult {
  jobs: Job[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export function useJobSearch() {
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (filters: SearchFilters) => {
    setLoading(true)
    setError(null)

    try {
      // Try Typesense search first
      const typesenseResponse = await fetch('/api/jobs/search-typesense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      if (typesenseResponse.ok) {
        const data = await typesenseResponse.json()
        setResults({
          jobs: data.jobs || [],
          total: data.total || 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          hasMore: (data.total || 0) > ((filters.page || 1) * (filters.limit || 10)),
        })
        return
      }

      // Fallback to basic API search
      console.log('Typesense not available, falling back to basic search')
      const fallbackResponse = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json()
        setResults({
          jobs: data.jobs || [],
          total: data.total || 0,
          page: filters.page || 1,
          limit: filters.limit || 10,
          hasMore: (data.total || 0) > ((filters.page || 1) * (filters.limit || 10)),
        })
      } else {
        throw new Error('Search failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    results,
    loading,
    error,
    search,
  }
}