'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Job {
  id: string
  title: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  type: string
  isRemote: boolean
  createdAt: string
  slug: string
  url: string
  category: {
    name: string
  }
  _count: {
    applications: number
  }
}

interface Company {
  id: string
  name: string
  description: string | null
  logo: string | null
  website: string | null
  location: string | null
  industry: string | null
  size: string | null
  foundedYear: number | null
  slug: string
  url: string
  jobs: Job[]
  _count: {
    jobs: number
  }
}

interface CompanyDetailClientProps {
  company: Company
}

export default function CompanyDetailClient({ company }: CompanyDetailClientProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start space-x-6">
            {company.logo && (
              <Image
                src={company.logo}
                alt={company.name}
                width={120}
                height={120}
                className="rounded-lg flex-shrink-0"
              />
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {company.name}
              </h1>

              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                {company.industry && <span>{company.industry}</span>}
                {company.location && <span>• {company.location}</span>}
                {company.size && <span>• {company.size} employees</span>}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span>💼 {company._count.jobs} open positions</span>
                </div>

                {company.foundedYear && (
                  <div className="flex items-center">
                    <span>📅 Founded {company.foundedYear}</span>
                  </div>
                )}

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    🌐 Visit Website →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {company.description && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  About {company.name}
                </h2>

                <div className="prose max-w-none">
                  <div className={showFullDescription ? '' : 'line-clamp-4'}>
                    {company.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {company.description.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-blue-600 hover:text-blue-700 font-medium mt-4"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Open Positions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Open Positions ({company.jobs.length})
              </h2>

              {company.jobs.length > 0 ? (
                <div className="space-y-4">
                  {company.jobs.map((job) => (
                    <div key={job.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link href={job.url} className="block">
                            <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 mb-1">
                              {job.title}
                            </h3>
                          </Link>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>{job.category.name}</span>
                            <span>•</span>
                            <span>{job.location || 'Remote'}</span>
                            <span>•</span>
                            <span>{job.type.replace('_', ' ')}</span>
                          </div>

                          {job.salaryMin && job.salaryMax && (
                            <div className="text-sm text-green-600 font-medium">
                              💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="text-right text-sm text-gray-500">
                          <div>{new Date(job.createdAt).toLocaleDateString()}</div>
                          <div>{job._count.applications} applicants</div>
                        </div>
                      </div>

                      <Link
                        href={job.url}
                        className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  ))}

                  {company._count.jobs > company.jobs.length && (
                    <div className="text-center pt-4">
                      <Link
                        href={`/jobs?company=${company.name}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all {company._count.jobs} positions →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">💼</div>
                  <p>No open positions at the moment.</p>
                  <p className="mt-2">Check back later for new opportunities!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Overview
              </h3>

              <div className="space-y-3">
                {company.industry && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry</span>
                    <span className="font-medium">{company.industry}</span>
                  </div>
                )}

                {company.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company Size</span>
                    <span className="font-medium">{company.size}</span>
                  </div>
                )}

                {company.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{company.location}</span>
                  </div>
                )}

                {company.foundedYear && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded</span>
                    <span className="font-medium">{company.foundedYear}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Open Positions</span>
                  <span className="font-medium">{company._count.jobs}</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            {company.website && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Connect
                </h3>

                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🌐 Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}