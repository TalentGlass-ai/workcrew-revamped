"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, MapPin, ChevronDown, IndianRupee } from "lucide-react";

/* Config */
import { config } from '@/workcrew-ui/lib/config';

/* Navbar & Footer */
import NewNavbar from "@/components/landing/NewNavbar";
import NewFooter from "@/components/landing/NewFooter";

/* Typography */
import T from "@/components/primitives/Typography";

/* Decorative (static import) */
import bg from "@/public/bg.png";

/* Types  */
import type { Job, JobsEnvelope, Option } from '@/types/index';

/* Utils */
import { getCompanyName, formatSalary, extractCity, normalizeSkills, getSalaryBucket, inferExperience, inferCategory, normalizeCompanySize } from '@/workcrew-ui/lib/utils/jobUtils';

/*  Category Chip (multi-select)  */
const Chip: React.FC<
  React.PropsWithChildren<{ active?: boolean; onClick?: () => void }>
> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-5 py-2 rounded-full transition border ${
      active
        ? "bg-[#4D31EC] text-white border-[#BFB4FF] shadow-sm"
        : "bg-white/70 text-black border-gray-300"
    }`}
  >
    <T variant="sub14" trackingPct={2} className="whitespace-nowrap">
      {children}
    </T>
    {active && (
      <span
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-[#4D31EC] grid place-items-center text-sm font-semibold shadow-sm"
        aria-hidden
      >
        ×
      </span>
    )}
  </button>
);

/* FilterBlock */
const FilterBlock: React.FC<{
  title: string;
  options: Option[]; // in UI we render labels at 14px
  selected: Set<string>;
  onToggle: (value: string) => void;
  searchable?: boolean;
  expandable?: boolean;
  collapsedCount?: number;
}> = ({
  title,
  options,
  selected,
  onToggle,
  searchable,
  expandable,
  collapsedCount = 6,
}) => {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const base = options;
    if (!q.trim()) return base;
    const n = q.toLowerCase();
    return base.filter((o) => o.label.toLowerCase().includes(n));
  }, [options, q]);

  const list = useMemo(() => {
    if (!expandable || expanded) return filtered;
    return filtered.slice(0, collapsedCount);
  }, [filtered, expandable, expanded, collapsedCount]);

  return (
    <div className="py-4 border-b last:border-b-0 border-gray-200 w-max">
      <button
        type="button"
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen((s) => !s)}
      >
        <T as="span" variant="body16" weight={500} trackingPct={3} className="text-[#444953]">
          {title}
        </T>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {searchable && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${title.toLowerCase().replace("jobs by ", "")}...`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4D31EC] w-full"
              style={{ fontFamily: "Archivo, system-ui, sans-serif", letterSpacing: "0.02em" }}
            />
          )}

          <div className="space-y-2">
            {list.map((opt) => {
              const isOn = selected.has(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => onToggle(opt.value)}
                    className="peer sr-only"
                  />
                  <span
                    className={`h-4 w-4 rounded-[6px] border-2 grid place-items-center transition ${
                      isOn ? "border-[#4D31EC]" : "border-gray-300 bg-white"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-[4px] transition ${
                        isOn ? "bg-[#4D31EC] opacity-100" : "opacity-0"
                      }`}
                    />
                  </span>
                  <T as="span" variant="sub14" trackingPct={3} className="text-black">
                    {opt.label}
                  </T>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <T as="p" variant="sub14" className="text-gray-500">
                No options available.
              </T>
            )}
          </div>

          {expandable && filtered.length > collapsedCount && (
            <button
              type="button"
              onClick={() => setExpanded((s) => !s)}
              className="text-[#4D31EC]"
              style={{ fontFamily: "Archivo, system-ui, sans-serif", fontWeight: 500, fontSize: 14 }}
            >
              {expanded ? "Hide" : "View more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/*  JobCard  */
const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const [expanded, setExpanded] = useState(false);
  const skills = normalizeSkills(job);
  const desc = job.description || "No description provided.";

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-6">
        {/* Left */}
        <div className="min-w-0">
          <T as="h3" variant="sub20" weight={600} lineHeightPx={27} className="truncate text-gray-900">
            {job.title || "Untitled Role"}
          </T>
          <T as="p" variant="sub14" weight={500} trackingPct={3} className="text-[#4D31EC] mt-0.5 truncate">
            {getCompanyName(job.company)}
          </T>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
            <span className="inline-flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" />
              {job.location || "—"}
            </span>
            <span className="text-sm">• {job.type || "—"}</span>
            {(job.salaryRange || job.salary) && (
              <span className="inline-flex items-center gap-1 text-sm">
                • <IndianRupee className="h-4 w-4" />
                {formatSalary(job.salaryRange || job.salary)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mt-3 leading-6">
            <T
              as="p"
              variant="body16"
              lineHeightPx={24}
              className={`${expanded ? "" : "line-clamp-2 overflow-hidden text-ellipsis"} transition-all duration-200 text-gray-700`}
            >
              {desc}
            </T>
            {desc.length > 0 && (
              <button
                onClick={() => setExpanded((s) => !s)}
                className="text-[#4D31EC] font-medium mt-1 text-sm"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="text-xs bg-[#F8F8FE] text-gray-800 px-3 py-1 rounded-full border border-gray-200"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="shrink-0">
          <button className="bg-[#4D31EC] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3b25b5] whitespace-nowrap">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* Page  */
export default function FindJobsPage() {
  const [search, setSearch] = useState("");
  const [locationText, setLocationText] = useState("");

  // Chips
  const CHIP_LABELS = [
    "Design",
    "Tech",
    "Marketing",
    "Sales",
    "Finance",
    "Operations",
  ] as const;
  const CHIP_MAP: Record<(typeof CHIP_LABELS)[number], string> = {
    Design: "design",
    Tech: "tech",
    Marketing: "marketing",
    Sales: "sales",
    Finance: "finance",
    Operations: "operations",
  };
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());

  // Filters
  const [fExperience, setFExperience] = useState<Set<string>>(new Set());
  const [fCategory, setFCategory] = useState<Set<string>>(new Set());
  const [fSize, setFSize] = useState<Set<string>>(new Set());

  const [fType, setFType] = useState<Set<string>>(new Set());
  const [fCities, setFCities] = useState<Set<string>>(new Set());
  const [fSkills, setFSkills] = useState<Set<string>>(new Set());
  const [fPay, setFPay] = useState<Set<string>>(new Set());

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const pages = [1, 2];
        const chunked: Job[] = [];
        for (const p of pages) {
          const res = await fetch(`${config.api.baseUrl}/api/v2/jobs?page=${p}&limit=10`, {
            cache: "no-store",
          });
          if (!res.ok) continue;
          const js: JobsEnvelope = await res.json();
          const list: Job[] =
            (Array.isArray(js)
              ? js
              : js.data ?? js.jobposts ?? js.jobs ?? js.result) || [];

          const normalized = list.map((j, i) => ({
            _id: j._id,
            id:
              j.id ??
              j._id ??
              `${j.title ?? "job"}|${getCompanyName(j.company)}|${
                j.location
              }|${p}-${i}`,
            title: j.title ?? "Untitled Role",
            description: j.description ?? "",
            type: j.type ?? "",
            location: j.location ?? "",
            salaryRange: j.salaryRange ?? j.salary ?? "",
            salary: j.salary ?? "",
            company: j.company ?? null,
            tags: j.tags ?? [],
            skills: normalizeSkills(j),
            experienceLevel: j.experienceLevel,
            category: j.category,
            companySize:
              j.companySize ??
              (typeof j.company === "object" ? j.company?.size : undefined),
          }));
          chunked.push(...normalized);
        }
        if (!cancelled) setAllJobs(chunked);
      } catch (e) {
        console.error("Error fetching jobs:", e);
        if (!cancelled) setAllJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Dynamic filter options */
  const dynamicTypeOpts: Option[] = useMemo(() => {
    const s = new Set<string>();
    allJobs.forEach((j) => j.type && s.add(j.type));
    return Array.from(s)
      .sort()
      .map((v) => ({ label: v, value: v }));
  }, [allJobs]);

  const dynamicCityOpts: Option[] = useMemo(() => {
    const s = new Set<string>();
    allJobs.forEach((j) => {
      const city = extractCity(j.location);
      if (city) s.add(city);
    });
    return Array.from(s)
      .sort()
      .map((v) => ({ label: v, value: v.toLowerCase() }));
  }, [allJobs]);

  const dynamicSkillOpts: Option[] = useMemo(() => {
    const s = new Set<string>();
    allJobs.forEach((j) => normalizeSkills(j).forEach((t) => s.add(t)));
    return Array.from(s)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ label: v, value: v.toLowerCase() }));
  }, [allJobs]);

  const dynamicPayOpts: Option[] = useMemo(() => {
    const counts: Record<string, number> = {};
    allJobs.forEach((j) => {
      const b = getSalaryBucket(j.salaryRange || j.salary || "");
      if (b) counts[b] = (counts[b] || 0) + 1;
    });
    const order: { label: string; value: string }[] = [
      { label: "0–3 LPA", value: "0-3" },
      { label: "3–5 LPA", value: "3-5" },
      { label: "5–7 LPA", value: "5-7" },
      { label: "7–10 LPA", value: "7-10" },
      { label: "10–15 LPA", value: "10-15" },
      { label: "15–20 LPA", value: "15-20" },
      { label: "20–30 LPA", value: "20-30" },
      { label: "30–50 LPA", value: "30-50" },
      { label: "Above 50 LPA", value: "50+" },
    ];
    return order.filter((o) => counts[o.value] > 0);
  }, [allJobs]);

  /* Filtering */
  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    const locTerm = locationText.trim().toLowerCase();

    return allJobs.filter((j) => {
      if (term) {
        const blob = `${j.title} ${getCompanyName(j.company)} ${normalizeSkills(j).join(
          " "
        )}`.toLowerCase();
        if (!blob.includes(term)) return false;
      }
      if (locTerm) {
        const city = extractCity(j.location).toLowerCase();
        if (!city.includes(locTerm)) return false;
      }

      if (selectedChips.size) {
        const jobCatNorm = (
          j.category || inferCategory(j.title, normalizeSkills(j))
        ).toLowerCase();
        const ok = Array.from(selectedChips).some(
          (chip) => jobCatNorm === CHIP_MAP[chip as keyof typeof CHIP_MAP]
        );
        if (!ok) return false;
      }

      if (fType.size && !fType.has(j.type || "")) return false;

      if (fCities.size) {
        const city = extractCity(j.location).toLowerCase();
        if (!fCities.has(city)) return false;
      }

      if (fSkills.size) {
        const skillset = new Set(
          normalizeSkills(j).map((s) => s.toLowerCase())
        );
        for (const s of fSkills) if (!skillset.has(s)) return false;
      }

      if (fPay.size) {
        const b = getSalaryBucket(j.salaryRange || j.salary || "");
        if (!b || !fPay.has(b)) return false;
      }

      if (fExperience.size) {
        const expNorm = (
          j.experienceLevel || inferExperience(j.title, j.description) || ""
        ).toLowerCase();
        if (!expNorm || !fExperience.has(expNorm)) return false;
      }

      if (fCategory.size) {
        const catNorm = (
          j.category || inferCategory(j.title, normalizeSkills(j))
        ).toLowerCase();
        if (!fCategory.has(catNorm)) return false;
      }

      if (fSize.size) {
        const sizeNorm = normalizeCompanySize(j);
        if (!sizeNorm || !fSize.has(sizeNorm)) return false;
      }

      return true;
    });
  }, [
    allJobs,
    search,
    locationText,
    selectedChips,
    fType,
    fCities,
    fSkills,
    fPay,
    fExperience,
    fCategory,
    fSize,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    search,
    locationText,
    selectedChips,
    fType,
    fCities,
    fSkills,
    fPay,
    fExperience,
    fCategory,
    fSize,
  ]);

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<Set<string>>>) =>
    (v: string) =>
      setter((old) => {
        const next = new Set(old);
        next.has(v) ? next.delete(v) : next.add(v);
        return next;
      });

  const toggleChip = (label: (typeof CHIP_LABELS)[number]) =>
    setSelectedChips((old) => {
      const next = new Set(old);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  return (
    <>
      <NewNavbar />

      <main className="min-h-screen bg-white text-black pt-0 pb-20">
        {/* ===== HERO (fixed 430px tall) ===== */}
        <section
          className="
            relative text-center overflow-hidden
            bg-gradient-to-r from-[#DCE3FF] via-[#EEF1FF] to-[#FFFFFF]
            -mt-[88px] md:-mt-[96px]
            h-[430px]
            z-[5]
          "
        >
          {/* content wrapper */}
          <div className="relative z-[5] pt-[150px] md:pt-[166px]">
            <T
              as="h1"
              variant="hero48"
              className="mb-4 text-[64px]"
              trackingPct={-1}
              weight={500}
              autoLeading
            >
              <span style={{ color: "#4D31EC" }}>Find jobs</span>, made just for you!
            </T>

            <T
              as="p"
              variant="body16"
              lineHeightPx={27}
              trackingPct={3}
              className="mx-auto text-black"
              style={{ maxWidth: "880px" }}
            >
              Discover opportunities that match your skills and ambitions! AI-powered matching ensures that you find roles that fit your skills and aspirations perfectly!
            </T>

            {/* Search row */}
            <div className="flex justify-center items-center gap-3 max-w-5xl mx-auto mt-5 px-6">
              <div className="flex items-center bg-white rounded-full h-[56px] w-full border border-gray-200 pl-5 pr-4">
                <Search className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  type="text"
                  placeholder='Search “UX Designer”'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="outline-none flex-1 bg-transparent text-gray-800"
                  style={{ fontFamily: "Archivo, system-ui, sans-serif", letterSpacing: "0.02em" }}
                />
              </div>
              <div className="flex items-center bg-white rounded-full h-[56px] w-full border border-gray-200 pl-5 pr-4">
                <MapPin className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="outline-none flex-1 bg-transparent text-gray-800"
                  style={{ fontFamily: "Archivo, system-ui, sans-serif", letterSpacing: "0.02em" }}
                />
              </div>
              <button
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="min-w-[150px] h-[56px] rounded-full bg-[#4D31EC] text-white font-semibold hover:bg-[#3b25b5] whitespace-nowrap px-8"
              >
                Find jobs
              </button>
            </div>
          </div>

          {/* Decorative bg image: full width */}
          <Image
            src={bg}
            alt="Decorative background"
            priority
            className="
              pointer-events-none select-none
              absolute bottom-0 left-0
              w-screen max-w-none h-auto
              opacity-90
              z-[1]
            "
          />
        </section>

        {/* ===== CHIPS ROW (on white, directly under grey banner) ===== */}
        <div className="bg-white relative z-[3]">
          <div className="flex justify-center flex-wrap gap-3 mt-[50px] mb-4 px-6">
            {CHIP_LABELS.map((tag) => (
              <Chip
                key={tag}
                active={selectedChips.has(tag)}
                onClick={() => toggleChip(tag)}
              >
                {tag}
              </Chip>
            ))}
          </div>
        </div>

        {/* ======= JOBS SECTION ======= */}
        <section className="pt-8 pb-16 flex justify-center bg-white relative z-0">
          <div className="w-full max-w-6xl px-6">
            <div className="grid items-start gap-8 md:[grid-template-columns:auto_minmax(0,1fr)]">
              {/* Left filters */}
              <aside className="bg-white rounded-2xl p-6 border border-gray-200 h-fit w-max max-w-[360px] mx-auto md:mx-0">
                <FilterBlock
                  title="Jobs by pay scale"
                  options={dynamicPayOpts}
                  selected={fPay}
                  onToggle={toggle(setFPay)}
                  expandable
                  collapsedCount={4}
                />
                <FilterBlock
                  title="Jobs by type"
                  options={dynamicTypeOpts}
                  selected={fType}
                  onToggle={toggle(setFType)}
                />
                <FilterBlock
                  title="Jobs by experience"
                  options={[
                    { label: "Fresher", value: "fresher" },
                    { label: "1Y–3Y", value: "1-3" },
                    { label: "3Y–5Y", value: "3-5" },
                    { label: "5Y–7Y", value: "5-7" },
                    { label: "7Y–10Y", value: "7-10" },
                    { label: "10Y+", value: "10+" },
                  ]}
                  selected={fExperience}
                  onToggle={toggle(setFExperience)}
                  expandable
                />
                <FilterBlock
                  title="Jobs by category"
                  options={[
                    { label: "Technology", value: "tech" },
                    { label: "Design", value: "design" },
                    { label: "Marketing", value: "marketing" },
                    { label: "Sales", value: "sales" },
                    { label: "Finance", value: "finance" },
                    { label: "Operations", value: "operations" },
                  ]}
                  selected={fCategory}
                  onToggle={toggle(setFCategory)}
                />
                <FilterBlock
                  title="Jobs by size"
                  options={[
                    { label: "Startups", value: "startup" },
                    { label: "Mid-sized", value: "mid" },
                    { label: "Big companies", value: "big" },
                  ]}
                  selected={fSize}
                  onToggle={toggle(setFSize)}
                />
                <FilterBlock
                  title="Jobs by location"
                  options={dynamicCityOpts}
                  selected={fCities}
                  onToggle={toggle(setFCities)}
                  searchable
                  expandable
                  collapsedCount={6}
                />
                <FilterBlock
                  title="Jobs by skills"
                  options={dynamicSkillOpts}
                  selected={fSkills}
                  onToggle={toggle(setFSkills)}
                  searchable
                  expandable
                  collapsedCount={8}
                />
              </aside>

              {/* Job cards */}
              <div className="min-w-0 space-y-6 pb-32">
                <T variant="body16" trackingPct={3} className="text-gray-600">
                  {Math.min(visibleCount, filteredJobs.length)} of {filteredJobs.length} jobs
                </T>

                {loading && (
                  <T as="div" variant="body16" className="text-center text-gray-500">
                    Loading jobs...
                  </T>
                )}

                {!loading && filteredJobs.length === 0 && (
                  <div className="text-center text-gray-500 py-10 rounded-2xl border border-dashed border-gray-300 bg-white">
                    <T variant="body16">No jobs found yet. Try clearing some filters.</T>
                  </div>
                )}

                {!loading &&
                  filteredJobs.slice(0, visibleCount).map((job) => (
                    <JobCard
                      key={
                        job._id ||
                        job.id ||
                        `${job.title}-${getCompanyName(job.company)}`
                      }
                      job={job}
                    />
                  ))}

                {!loading && filteredJobs.length > visibleCount && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                      className="px-6 py-3 rounded-full bg-white border border-gray-300 hover:border-[#4D31EC] text-sm font-medium"
                      style={{ fontFamily: "Archivo, system-ui, sans-serif" }}
                    >
                      Load more jobs
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <NewFooter />
    </>
  );
}
