'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type Job = {
  id: string;
  title: string;
  location: string | null;
  jobType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  seoSlug: string | null;
  createdAt: string;
  url: string;
  _count: { applications: number };
};

type Company = {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  location: string | null;
  industry: string | null;
  size: string | null;
  slug: string;
  jobs: Job[];
  _count: { jobs: number };
};

export default function CompanyDetailClient({ company }: { company: Company }) {
  const [showFull, setShowFull] = useState(false);

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#4D31EC] to-[#6D56F0] text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/find-jobs" className="text-sm text-white/60 hover:text-white transition-colors">
            ← Find Jobs
          </Link>
          <div className="mt-4 flex items-center gap-5">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name}
                width={72}
                height={72}
                className="rounded-xl bg-white object-contain p-1 flex-shrink-0"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-3xl font-bold text-white">
                {company.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <p className="mt-1 text-sm text-white/70">
                {[company.industry, company.location, company.size ? `${company.size} employees` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="rounded-full bg-white/20 px-3 py-0.5 font-medium">
                  {company._count.jobs} open role{company._count.jobs !== 1 ? 's' : ''}
                </span>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors">
                    🌐 Website ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {company.description && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-900">About {company.name}</h2>
              <div className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${!showFull ? 'line-clamp-4' : ''}`}>
                {company.description}
              </div>
              {company.description.length > 200 && (
                <button onClick={() => setShowFull(v => !v)}
                  className="mt-2 text-xs font-semibold text-[#4D31EC] hover:underline">
                  {showFull ? 'Show less' : 'Read more'}
                </button>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Open Positions ({company._count.jobs})
            </h2>
            {company.jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                <p className="text-sm text-gray-400">No open positions right now — check back soon.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {company.jobs.map((job) => {
                  const sal = job.salaryMin && job.salaryMax
                    ? `$${Math.round(job.salaryMin / 1000)}k–$${Math.round(job.salaryMax / 1000)}k`
                    : null;
                  return (
                    <div key={job.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <Link href={job.url}
                          className="font-semibold text-gray-900 hover:text-[#4D31EC] transition-colors">
                          {job.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {[job.location, job.jobType, sal].filter(Boolean).join(' · ')}
                          {job._count.applications > 0 && ` · ${job._count.applications} applicant${job._count.applications !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <Link href={job.url}
                        className="flex-shrink-0 rounded-lg bg-[#4D31EC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b25b5] transition-colors">
                        Apply →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Company Overview</h3>
            <dl className="space-y-2 text-sm">
              {company.industry && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Industry</dt>
                  <dd className="font-medium text-gray-800 text-right">{company.industry}</dd>
                </div>
              )}
              {company.size && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Size</dt>
                  <dd className="font-medium text-gray-800 text-right">{company.size} employees</dd>
                </div>
              )}
              {company.location && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-800 text-right">{company.location}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Open roles</dt>
                <dd className="font-medium text-[#4D31EC]">{company._count.jobs}</dd>
              </div>
            </dl>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center rounded-lg border border-[#4D31EC]/20 bg-[#4D31EC]/5 px-4 py-2 text-sm font-semibold text-[#4D31EC] hover:bg-[#4D31EC]/10 transition-colors">
                Visit Website ↗
              </a>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
