"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : { notifications: [], unreadCount: 0 })
      .then((d) => { setNotifications(d.notifications ?? []); setUnreadCount(d.unreadCount ?? 0); })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [status, fetchNotifications]);

  // Close notif dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  function openNotifPanel() {
    setNotifOpen((o) => !o);
    setMenuOpen(false);
    if (!notifOpen && unreadCount > 0) {
      fetch("/api/notifications", { method: "PATCH" })
        .then(() => { setUnreadCount(0); setNotifications((ns) => ns.map((n) => ({ ...n, read: true }))); })
        .catch(() => null);
    }
  }

  function handleNotifClick(n: Notification) {
    setNotifOpen(false);
    if (n.link) router.push(n.link);
  }

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

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={openNotifPanel}
            aria-label="Notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4D31EC] text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-gray-100 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-xs text-gray-400">{notifications.filter(n => !n.read).length === 0 ? "All read" : `${notifications.filter(n => !n.read).length} unread`}</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">No notifications yet</p>
                ) : notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!n.read ? "bg-[#4D31EC]/5" : ""}`}
                  >
                    <p className={`text-sm font-medium ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{n.body}</p>
                    <p className="mt-1 text-[10px] text-gray-300">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
              <Link href="/settings" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Settings
              </Link>
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
