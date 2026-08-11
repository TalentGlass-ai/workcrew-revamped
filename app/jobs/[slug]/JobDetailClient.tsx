'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  description: string
  location: string | null
  latitude: number | null
  longitude: number | null
  salaryMin: number | null
  salaryMax: number | null
  type: string
  experience: string | null
  skills: string | null
  benefits: string | null
  isRemote: boolean
  createdAt: string
  slug: string
  url: string
  company: {
    id: string
    name: string
    description: string | null
    logo: string | null
    website: string | null
    location: string | null
    industry: string | null
    size: string | null
    _count: {
      jobs: number
    }
  }
  category: {
    id: string
    name: string
  }
  applications: any[]
  _count: {
    applications: number
    savedJobs: number
  }
  similarJobs: any[]
}

interface JobDetailClientProps {
  job: Job
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCover, setShowCover] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleSave = async () => {
    if (!session) { router.push('/login'); return; }
    setSaving(true);
    if (saved) {
      await fetch(`/api/saved-jobs?jobId=${job.id}`, { method: 'DELETE' });
      setSaved(false);
    } else {
      await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });
      setSaved(true);
    }
    setSaving(false);
  }

  const handleGenerateCover = async () => {
    if (!session) { router.push('/login'); return; }
    setShowCover(true)
    if (coverLetter) return
    setGenerating(true)
    try {
      const res = await fetch('/api/candidates/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok && d.coverLetter) setCoverLetter(d.coverLetter)
      else setApplyError(d.error ?? 'Could not generate a draft. You can still apply.')
    } finally {
      setGenerating(false)
    }
  }

  const handleApply = async () => {
    if (!session) { router.push('/login'); return; }
    setApplying(true)
    setApplyError(null)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, coverLetter: showCover ? coverLetter : undefined }),
      })
      if (res.status === 409) { setApplied(true); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setApplyError(d.error ?? 'Failed to apply. Please try again.')
        return
      }
      setApplied(true)
    } finally {
      setApplying(false)
    }
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salary not disclosed'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
    return 'Salary not disclosed'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start space-x-6">
            {job.company.logo && (
              <Image
                src={job.company.logo}
                alt={job.company.name}
                width={80}
                height={80}
                className="rounded-lg flex-shrink-0"
              />
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>

              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <Link
                  href={`/companies/${job.company.name.toLowerCase().replace(/\s+/g, '-')}-${job.company.id.slice(-8)}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-700"
                >
                  {job.company.name}
                </Link>
                <span>•</span>
                <span>{job.location || 'Remote'}</span>
                <span>•</span>
                <span>{job.type.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium text-green-600">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center">
                  <span>👁️ {job._count.applications} applicants</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  title={saved ? "Remove from saved" : "Save job"}
                  className={`rounded-lg border px-3 py-3 text-sm transition-colors disabled:opacity-50 ${
                    saved
                      ? 'border-[#4D31EC] bg-[#4D31EC]/10 text-[#4D31EC]'
                      : 'border-gray-200 text-gray-400 hover:border-[#4D31EC]/40 hover:text-[#4D31EC]'
                  }`}
                >
                  {saved ? '🔖' : '🔖'}
                </button>
                {!applied && (
                  <button
                    onClick={handleGenerateCover}
                    disabled={generating}
                    title="Generate an AI cover letter draft from your profile"
                    className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                      showCover
                        ? 'border-[#4D31EC] bg-[#4D31EC]/10 text-[#4D31EC]'
                        : 'border-gray-200 text-gray-500 hover:border-[#4D31EC]/40 hover:text-[#4D31EC]'
                    }`}
                  >
                    ✨ Cover letter
                  </button>
                )}
                <button
                  onClick={handleApply}
                  disabled={applied || applying}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    applied
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'
                  }`}
                >
                  {applied ? 'Applied ✓' : applying ? 'Applying…' : showCover ? 'Apply with cover letter' : 'Apply Now'}
                </button>
              </div>
              {applyError && <p className="text-xs text-red-500">{applyError}</p>}
              {applied && (
                <Link href="/dashboard/applications" className="text-xs text-blue-600 hover:underline">
                  View application →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cover letter draft */}
      {showCover && !applied && (
        <div className="border-b bg-[#F7F8FC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="rounded-xl border border-[#4D31EC]/20 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">✨ Cover letter</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setCoverLetter(''); handleGenerateCover(); }}
                    disabled={generating}
                    className="text-xs font-semibold text-[#4D31EC] hover:underline disabled:opacity-50"
                  >
                    {generating ? 'Generating…' : 'Regenerate'}
                  </button>
                  <button
                    onClick={() => setShowCover(false)}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {generating && !coverLetter ? (
                <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
              ) : (
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={10}
                  placeholder="Your cover letter draft will appear here…"
                  className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all"
                />
              )}
              <p className="mt-2 text-xs text-gray-400">
                AI-generated from your profile — review and edit before applying. It's sent to the recruiter with your application.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>

              <div className="prose max-w-none">
                <div className={showFullDescription ? '' : 'line-clamp-6'}>
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {job.description.length > 500 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-600 hover:text-blue-700 font-medium mt-4"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>

            {/* Requirements */}
            {(job.experience || job.skills) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Requirements
                </h2>

                <div className="space-y-4">
                  {job.experience && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                      <p className="text-gray-700">{job.experience}</p>
                    </div>
                  )}

                  {job.skills && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.split(',').map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Benefits & Perks
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.split(',').map((benefit, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <span className="mr-2">✓</span>
                      {benefit.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About {job.company.name}
              </h3>

              {job.company.description && (
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {job.company.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                {job.company.industry && (
                  <div>🏢 Industry: {job.company.industry}</div>
                )}
                {job.company.size && (
                  <div>👥 Company Size: {job.company.size}</div>
                )}
                {job.company.location && (
                  <div>📍 Headquarters: {job.company.location}</div>
                )}
                <div>💼 Open Positions: {job.company._count.jobs}</div>
              </div>

              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Visit Website →
                </a>
              )}
            </div>

            {/* Job Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Overview
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{job.category.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{job.type.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Remote</span>
                  <span className="font-medium">{job.isRemote ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">{job._count.applications}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        {job.similarJobs && job.similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Similar Jobs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {job.similarJobs.map((similarJob) => (
                <div key={similarJob.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                  <Link href={similarJob.url}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                      {similarJob.title}
                    </h3>
                  </Link>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{similarJob.company.name}</div>
                    <div>{similarJob.location || 'Remote'}</div>
                    <div className="text-green-600 font-medium">
                      {similarJob.salaryMin && similarJob.salaryMax
                        ? `$${similarJob.salaryMin.toLocaleString()} - $${similarJob.salaryMax.toLocaleString()}`
                        : 'Salary not disclosed'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}