"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  const name = session?.user?.name ?? "there";

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold" style={{ color: "#4D31EC" }}>
          Welcome back, {name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-gray-500">Here's what you can do today.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <DashCard
            href="/find-jobs"
            title="Find Jobs"
            desc="Browse AI-matched roles tailored to your skills."
          />
          <DashCard
            href="/onboarding/personal-details"
            title="Update Profile"
            desc="Keep your personal details and resume up to date."
          />
          <DashCard
            href="/onboarding/upload-resume"
            title="Upload Resume"
            desc="Re-parse a new resume to refresh your profile."
          />
          <DashCard
            href="/ai-interviewer"
            title="AI Mock Interview"
            desc="Practice for your next interview with our AI coach."
          />
        </div>
      </div>
    </main>
  );
}

function DashCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border bg-white p-6 shadow-sm hover:border-[#4D31EC] hover:shadow-md transition"
    >
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  );
}
