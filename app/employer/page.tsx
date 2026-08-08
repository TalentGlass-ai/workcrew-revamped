"use client";

import Link from "next/link";

export default function EmployerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold" style={{ color: "#4D31EC" }}>
        Employer Dashboard
      </h1>
      <p className="max-w-md text-gray-500">
        The employer portal is coming soon. You're logged in as an employer.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#4D31EC] px-6 py-3 font-semibold text-white hover:bg-[#3b25b5]"
      >
        Back to home
      </Link>
    </main>
  );
}
