"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

// Public/marketing routes that have their own navigation
const HIDDEN_PREFIXES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/about", "/blogs", "/pricing"];

function shouldHide(path: string) {
  if (path === "/") return true;
  return HIDDEN_PREFIXES.slice(1).some((p) => path === p || path.startsWith(p + "/") && p !== "/");
}

const CANDIDATE_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/assessments", label: "Assessments" },
  { href: "/ai-interviewer", label: "AI Interview" },
];

const RECRUITER_LINKS = [
  { href: "/employer", label: "Dashboard" },
  { href: "/assessments", label: "Assessments" },
  { href: "/billing", label: "Billing" },
];

export function AppNavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (shouldHide(pathname) || status === "unauthenticated" || status === "loading") return null;

  const role = (session?.user as any)?.role ?? "candidate";
  const isRecruiter = role === "recruiter" || role === "admin";
  const links = isRecruiter ? RECRUITER_LINKS : CANDIDATE_LINKS;
  const firstName = session?.user?.name?.split(" ")[0] ?? "You";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href={isRecruiter ? "/employer" : "/dashboard"} className="flex-shrink-0">
          <Image src="/workcrew-icon.png" alt="WorkCrew.ai" width={100} height={18} priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-[#4D31EC]/10 text-[#4D31EC]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* User menu */}
        <div className="relative flex items-center gap-3">
          <div className="hidden text-sm text-gray-500 md:block">
            {isRecruiter && <span className="mr-2 rounded-full bg-[#4D31EC]/10 px-2 py-0.5 text-xs font-semibold text-[#4D31EC]">Recruiter</span>}
            {firstName}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4D31EC] text-sm font-semibold text-white"
            aria-label="User menu"
          >
            {firstName[0]?.toUpperCase()}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-400">{session?.user?.email}</div>
              {links.map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/login" }); }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="ml-2 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-medium ${pathname === href ? "text-[#4D31EC]" : "text-gray-700"}`}>
              {label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 block text-sm text-red-600">Sign out</button>
        </div>
      )}
    </header>
  );
}
