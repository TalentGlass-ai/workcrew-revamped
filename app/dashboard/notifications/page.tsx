"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const TYPE_ICON: Record<string, string> = {
  stage_change: "📋",
  assessment_assigned: "🧪",
  hired: "🎉",
  rejected: "❌",
  interview_proposed: "📅",
  interview_confirmed: "✅",
  ai_interview_requested: "🤖",
  new_message: "💬",
  candidate_search_exhausted: "🔍",
};

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(d => setNotifs(d.notifications ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  }

  const unread = notifs.filter(n => !n.read).length;

  if (status === "loading" || loading) return null;

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Dashboard
          </Link>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unread > 0 && (
                <p className="mt-0.5 text-sm text-gray-500">{unread} unread</p>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors">
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
        {notifs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center">
            <p className="text-4xl">🔔</p>
            <p className="mt-4 text-base font-medium text-gray-500">No notifications yet</p>
            <p className="mt-1 text-sm text-gray-400">We'll let you know when something happens.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
            {notifs.map(n => {
              const icon = TYPE_ICON[n.type] ?? "🔔";
              const row = (
                <div className={`flex gap-4 px-5 py-4 transition-colors hover:bg-gray-50 ${!n.read ? "bg-[#4D31EC]/[0.03]" : ""}`}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {n.title}
                      </p>
                      <span className="flex-shrink-0 text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500 leading-snug">{n.body}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#4D31EC]" />
                  )}
                </div>
              );

              return n.link
                ? <Link key={n.id} href={n.link}>{row}</Link>
                : <div key={n.id}>{row}</div>;
            })}
          </div>
        )}
      </div>
    </main>
  );
}
