'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import T from './primitives/Typography'

interface JobSuggestion {
  id: string
  title: string
  companyName: string
  location: string
  type: string
  isRemote: boolean
}

interface InstantSearchProps {
  onSearch: (query: string, location?: string) => void
  placeholder?: string
  className?: string
}

export default function InstantSearch({
  onSearch,
  placeholder = "Search jobs, companies, skills...",
  className = ""
}: InstantSearchProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [suggestions, setSuggestions] = useState<JobSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const response = await fetch('/api/jobs/search-typesense', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: query,
              location: location || undefined,
              page: 1,
              limit: 5, // Just suggestions
            }),
          })

          if (response.ok) {
            const data = await response.json()
            setSuggestions(data.jobs || [])
            setShowSuggestions(true)
          }
        } catch (error) {
          console.error('Search suggestions failed:', error)
        } finally {
          setLoading(false)
        }
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, location])

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, location)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: JobSuggestion) => {
    setQuery(suggestion.title)
    setLocation(suggestion.location)
    onSearch(suggestion.title, suggestion.location)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery('')
    setLocation('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          {/* Job Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Location Input */}
          <div className="relative w-64">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <T variant="sub14" className="font-medium text-gray-900">
                    {suggestion.title}
                  </T>
                  <T variant="sub" className="text-gray-600">
                    {suggestion.companyName}
                  </T>
                </div>
                <div className="text-right ml-4">
                  <T variant="sub" className="text-gray-500">
                    {suggestion.location}
                  </T>
                  <div className="flex gap-1 mt-1">
                    {suggestion.isRemote && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Remote
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {suggestion.type}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <T variant="sub14" className="text-gray-600">Searching...</T>
          </div>
        </div>
      )}
    </div>
  )
}