"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationBell({ allHref = "/dashboard/notifications" }: { allHref?: string }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : { notifications: [], unreadCount: 0 })
      .then(d => { setNotifs(d.notifications ?? []); setUnread(d.unreadCount ?? 0); });
  }

  useEffect(() => { load(); }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-[#4D31EC]/40 hover:text-[#4D31EC] transition-colors"
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4D31EC] text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-[#4D31EC] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</p>
            ) : notifs.slice(0, 8).map(n => (
              <NotifRow key={n.id} n={n} onClose={() => setOpen(false)} />
            ))}
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <Link href={allHref} onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-[#4D31EC] hover:underline">
              See all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifRow({ n, onClose }: { n: Notif; onClose: () => void }) {
  const content = (
    <div className={`flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${!n.read ? "bg-[#4D31EC]/[0.03]" : ""}`}>
      {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#4D31EC]" />}
      {n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0" />}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-900 leading-snug">{n.title}</p>
        <p className="mt-0.5 text-xs text-gray-500 leading-snug line-clamp-2">{n.body}</p>
        <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
      </div>
    </div>
  );

  if (n.link) {
    return <Link href={n.link} onClick={onClose}>{content}</Link>;
  }
  return <div>{content}</div>;
}
