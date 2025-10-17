// // PATH: app/find-jobs/page.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, MapPin, ChevronDown, IndianRupee } from "lucide-react";

/* Navbar & Footer */
import NewNavbar from "../../workcrew-ui/components/landing/NewNavbar";
import NewFooter from "../../workcrew-ui/components/landing/NewFooter";

/* Decorative (static import) */
import bg from "../../public/bg.png";

/* Types  */
type Job = {
  _id?: string;
  id?: string | number;
  title?: string;
  description?: string;
  type?: string;
  location?: string;
  salaryRange?: string;
  salary?: string;
  company?:
    | { companyName?: string; name?: string; size?: string | number }
    | string
    | null;
  tags?: string[];
  skills?: string[];

  experienceLevel?: string;
  category?: string;
  companySize?: string | number;
};

type JobsEnvelope =
  | Job[]
  | {
      data?: Job[];
      jobs?: Job[];
      jobposts?: Job[];
      result?: Job[];
      total?: number;
      count?: number;
      page?: number;
      limit?: number;
    };

type Option = { label: string; value: string };

const companyName = (c: Job["company"]) =>
  (typeof c === "string" ? c : c?.companyName || c?.name) || "—";

/*  Category Chip (multi-select)  */
const Chip: React.FC<
  React.PropsWithChildren<{ active?: boolean; onClick?: () => void }>
> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-5 py-2 rounded-full text-sm transition border ${
      active
        ? "bg-[#4D31EC] text-white border-[#BFB4FF] shadow-sm"
        : "bg-white/70 text-black border-gray-300"
    }`}
    style={{
      fontFamily: "Archivo, system-ui, sans-serif",
      letterSpacing: "0.02em",
    }}
  >
    {children}
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
  options: Option[];
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
        <span
          className="text-sm font-medium"
          style={{
            fontFamily: "Archivo, system-ui, sans-serif",
            fontSize: "16px",
            letterSpacing: "0.03em",
            color: "#444953",
          }}
        >
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {searchable && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${title
                .toLowerCase()
                .replace("jobs by ", "")}...`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#4D31EC] w-full"
              style={{ fontFamily: "Archivo, system-ui, sans-serif" }}
            />
          )}

          <div className="space-y-2">
            {list.map((opt) => {
              const isOn = selected.has(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer select-none"
                  style={{
                    fontFamily: "Archivo, system-ui, sans-serif",
                    fontSize: "14px",
                    letterSpacing: "0.03em",
                    color: "#000000",
                  }}
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
                  {opt.label}
                </label>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-500">No options available.</p>
            )}
          </div>

          {expandable && filtered.length > collapsedCount && (
            <button
              type="button"
              onClick={() => setExpanded((s) => !s)}
              className="text-[#4D31EC] text-sm font-medium"
              style={{ fontFamily: "Archivo, system-ui, sans-serif" }}
            >
              {expanded ? "Hide" : "View more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* Helpers  */
function formatSalary(s: string | undefined) {
  if (!s) return "—";
  return s.replace(/^₹\s*/i, "");
}
function onlyCity(loc?: string) {
  if (!loc) return "";
  const [city] = (loc || "").split(",").map((x) => x.trim());
  return city || loc || "";
}
function normalizeSkills(job: Job): string[] {
  const base = (job.skills && job.skills.length ? job.skills : job.tags) || [];
  return Array.from(new Set(base.map((s) => s.trim()).filter(Boolean)));
}
function salaryBucket(s?: string) {
  if (!s) return null;
  const str = s.toLowerCase().replace(/[,₹\s]/g, "");
  const lpaMatch = str.match(/(\d+)(?:-|\sto\s)?(\d+)?lpa/);
  if (lpaMatch) {
    const a = parseInt(lpaMatch[1], 10);
    const b = parseInt(lpaMatch[2] ? lpaMatch[2] : lpaMatch[1], 10);
    const mid = (a + b) / 2;
    if (mid <= 3) return "0-3";
    if (mid <= 5) return "3-5";
    if (mid <= 7) return "5-7";
    if (mid <= 10) return "7-10";
    if (mid <= 15) return "10-15";
    if (mid <= 20) return "15-20";
    if (mid <= 30) return "20-30";
    if (mid <= 50) return "30-50";
    return "50+";
  }
  const kMatch = str.match(/(\d+)\s*k(?:-|\sto\s)?(\d+)?\s*k?/);
  if (kMatch) {
    const a = parseInt(kMatch[1], 10);
    const b = parseInt(kMatch[2] || String(a), 10);
    const mid = (a + b) / 2;
    if (mid <= 300) return "0-3";
    if (mid <= 500) return "3-5";
    if (mid <= 700) return "5-7";
    if (mid <= 1000) return "7-10";
    if (mid <= 1500) return "10-15";
    if (mid <= 2000) return "15-20";
    if (mid <= 3000) return "20-30";
    if (mid <= 5000) return "30-50";
    return "50+";
  }
  return null;
}

/*  Heuristics  */
function inferExperience(title?: string, desc?: string): string | null {
  const blob = `${title || ""} ${desc || ""}`.toLowerCase();
  if (/\b(intern|internship|fresher|entry[-\s]?level|junior)\b/.test(blob))
    return "fresher";
  if (/\b(1[\s-]?3|1–3|1 to 3|1-3)\b/.test(blob)) return "1-3";
  if (/\b(3[\s-]?5|3–5|3 to 5|3-5)\b/.test(blob)) return "3-5";
  if (/\b(5[\s-]?7|5–7|5 to 7|5-7)\b/.test(blob)) return "5-7";
  if (/\b(7[\s-]?10|7–10|7 to 10|7-10)\b/.test(blob)) return "7-10";
  if (/\b(10\+|10\+ years|senior|lead|principal)\b/.test(blob)) return "10+";
  return null;
}
function inferCategory(title?: string, skills: string[] = []): string {
  const blob = `${title || ""} ${skills.join(" ")}`.toLowerCase();
  if (
    /\b(ui|ux|designer|figma|illustrator|photoshop|product\s*design)\b/.test(
      blob
    )
  )
    return "design";
  if (/\b(marketing|seo|sem|content|growth)\b/.test(blob)) return "marketing";
  if (/\b(sales|bd|business\s*development|account\s*executive)\b/.test(blob))
    return "sales";
  if (/\b(finance|accounting|analyst|fp&a|treasury)\b/.test(blob))
    return "finance";
  if (/\b(ops|operations|supply\s*chain|logistics)\b/.test(blob))
    return "operations";
  return "tech";
}
function normalizeCompanySize(j: Job): "startup" | "mid" | "big" | null {
  const size =
    j.companySize ??
    (typeof j.company === "object" ? j.company?.size : undefined);
  if (typeof size === "string") {
    const s = size.toLowerCase();
    if (/start/.test(s) || /\b(1-50|1–50|<\s*50)\b/.test(s)) return "startup";
    if (/\b(51-500|51–500|100-1000|100–1000)\b/.test(s)) return "mid";
    if (/big|enterprise|>\s*1000|1000\+/.test(s)) return "big";
  } else if (typeof size === "number") {
    if (size <= 50) return "startup";
    if (size <= 1000) return "mid";
    return "big";
  }
  return null;
}

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
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {job.title || "Untitled Role"}
          </h3>
          <p className="text-sm text-[#4D31EC] mt-0.5 truncate">
            {companyName(job.company)}
          </p>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location || "—"}
            </span>
            <span>• {job.type || "—"}</span>
            {(job.salaryRange || job.salary) && (
              <span className="inline-flex items-center gap-1">
                • <IndianRupee className="h-4 w-4" />
                {formatSalary(job.salaryRange || job.salary)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mt-3 text-sm text-gray-700 leading-6">
            <p
              className={`${
                expanded ? "" : "line-clamp-2 overflow-hidden text-ellipsis"
              } transition-all duration-200`}
            >
              {desc}
            </p>
            {desc.length > 0 && (
              <button
                onClick={() => setExpanded((s) => !s)}
                className="text-[#4D31EC] font-medium mt-1"
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

  const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const pages = [1, 2];
        const chunked: Job[] = [];
        for (const p of pages) {
          const res = await fetch(`${API}/api/v2/jobs?page=${p}&limit=10`, {
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
              `${j.title ?? "job"}|${companyName(j.company)}|${
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
  }, [API]);

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
      const city = onlyCity(j.location);
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
      const b = salaryBucket(j.salaryRange || j.salary || "");
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
        const blob = `${j.title} ${companyName(j.company)} ${normalizeSkills(j).join(
          " "
        )}`.toLowerCase();
        if (!blob.includes(term)) return false;
      }
      if (locTerm) {
        const city = onlyCity(j.location).toLowerCase();
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
        const city = onlyCity(j.location).toLowerCase();
        if (!fCities.has(city)) return false;
      }

      if (fSkills.size) {
        const skillset = new Set(
          normalizeSkills(j).map((s) => s.toLowerCase())
        );
        for (const s of fSkills) if (!skillset.has(s)) return false;
      }

      if (fPay.size) {
        const b = salaryBucket(j.salaryRange || j.salary || "");
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
            bg-gradient-to-b from-[#F6F7FC] to-[#ECEFF8]
            -mt-[88px] md:-mt-[96px]
            h-[470px]
          "
        >
          {/* content wrapper — extra top padding so banner content sits lower */}
          <div className="relative z-10 pt-[170px] md:pt-[186px]">
            <h1
              className="mb-4"
              style={{
                fontFamily: "Schibsted Grotesk, system-ui, sans-serif",
                fontSize: "64px",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ color: "#4D31EC" }}>Find jobs</span>, made just for
              you!
            </h1>

            <p
              className="mx-auto"
              style={{
                fontFamily: "Archivo, system-ui, sans-serif",
                fontSize: "16px",
                lineHeight: "27px",
                letterSpacing: "0.03em",
                color: "#000000",
                maxWidth: "880px",
              }}
            >
              Discover opportunities that match your skills and ambitions!
              AI-powered matching ensures that you find roles that fit your
              skills and aspirations perfectly!
            </p>

            {/* Search row */}
            <div className="flex justify-center items-center gap-3 max-w-5xl mx-auto mt-7 px-6">
              <div className="flex items-center bg-white rounded-full h-[60px] w-full border border-gray-200 pl-5 pr-4">
                <Search className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  type="text"
                  placeholder='Search “UX Designer”'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="outline-none flex-1 bg-transparent text-gray-800"
                  style={{ fontFamily: "Archivo, system-ui, sans-serif" }}
                />
              </div>
              <div className="flex items-center bg-white rounded-full h-[60px] w-full border border-gray-200 pl-5 pr-4">
                <MapPin className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="outline-none flex-1 bg-transparent text-gray-800"
                  style={{ fontFamily: "Archivo, system-ui, sans-serif" }}
                />
              </div>
              <button
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="min-w-[150px] h-[60px] rounded-full bg-[#4D31EC] text-white font-semibold hover:bg-[#3b25b5] whitespace-nowrap px-8"
              >
                Find jobs
              </button>
            </div>

            {/* Chips inside the grey banner */}
            <div className="flex justify-center flex-wrap gap-3 mt-6 px-6">
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

          {/* Decorative bg image anchored to the bottom of the banner */}
          <Image
            src={bg}
            alt="Decorative background"
            priority
            className="
              pointer-events-none select-none
              absolute bottom-0 left-1/2 -translate-x-1/2
              w-[92vw] max-w-[1100px] h-auto
              opacity-90
            "
          />
        </section>

        {/* ======= JOBS SECTION ======= */}
        <section className="py-16 flex justify-center bg-white relative z-0">
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
                <div
                  className="text-sm text-gray-600"
                  style={{
                    fontFamily: "Archivo, system-ui, sans-serif",
                    letterSpacing: "0.03em",
                  }}
                >
                  {Math.min(visibleCount, filteredJobs.length)} of{" "}
                  {filteredJobs.length} jobs
                </div>

                {loading && (
                  <div className="text-center text-gray-500">
                    Loading jobs...
                  </div>
                )}

                {!loading && filteredJobs.length === 0 && (
                  <div className="text-center text-gray-500 py-10 rounded-2xl border border-dashed border-gray-300 bg-white">
                    No jobs found yet. Try clearing some filters.
                  </div>
                )}

                {!loading &&
                  filteredJobs.slice(0, visibleCount).map((job) => (
                    <JobCard
                      key={
                        job._id ||
                        job.id ||
                        `${job.title}-${companyName(job.company)}`
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
