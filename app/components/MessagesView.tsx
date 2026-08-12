"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

type Thread = { id: string; title: string; subtitle: string; lastMessage: string; lastAt: string | null; unread: number };
type Message = { id: string; body: string; createdAt: string; mine: boolean; senderName: string };

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function MessagesView({ inboxUrl, homeHref, homeLabel }: { inboxUrl: string; homeHref: string; homeLabel: string }) {
  const router = useRouter();
  const activeId = useSearchParams().get("app");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<{ title: string; subtitle: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(() => {
    fetch(inboxUrl)
      .then(r => r.ok ? r.json() : { threads: [] })
      .then(d => setThreads(d.threads ?? []))
      .finally(() => setLoadingThreads(false));
  }, [inboxUrl]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  const loadThread = useCallback((id: string) => {
    fetch(`/api/applications/${id}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setMessages(d.messages ?? []);
        setMeta({ title: d.title, subtitle: d.subtitle });
      });
  }, []);

  // Load the open thread + poll it while open (lazy near-real-time)
  useEffect(() => {
    if (!activeId) { setMessages([]); setMeta(null); return; }
    loadThread(activeId);
    const t = setInterval(() => loadThread(activeId), 10_000);
    return () => clearInterval(t);
  }, [activeId, loadThread]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function open(id: string) {
    router.replace(`?app=${id}`, { scroll: false });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeId) return;
    setSending(true);
    const res = await fetch(`/api/applications/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) {
      const d = await res.json();
      setMessages(prev => [...prev, d.message]);
      setDraft("");
      loadThreads();
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link href={homeHref} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← {homeLabel}</Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="grid gap-4 md:grid-cols-[300px_1fr]">
          {/* Thread list */}
          <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${activeId ? "hidden md:block" : ""}`}>
            {loadingThreads ? (
              <div className="p-4 space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />)}</div>
            ) : threads.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">No conversations yet.</p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
                {threads.map(t => (
                  <button key={t.id} onClick={() => open(t.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${activeId === t.id ? "bg-[#4D31EC]/5" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                      <span className="flex-shrink-0 text-[10px] text-gray-400">{timeAgo(t.lastAt)}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{t.subtitle}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-500 truncate">{t.lastMessage}</p>
                      {t.unread > 0 && (
                        <span className="flex-shrink-0 rounded-full bg-[#4D31EC] px-1.5 text-[10px] font-semibold text-white">{t.unread}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Thread detail */}
          <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col ${activeId ? "" : "hidden md:flex"}`} style={{ height: "70vh" }}>
            {!activeId ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-gray-400">Select a conversation</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
                  <button onClick={() => router.replace("?", { scroll: false })} className="md:hidden text-gray-400">←</button>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{meta?.title ?? ""}</p>
                    <p className="text-xs text-gray-400 truncate">{meta?.subtitle ?? ""}</p>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 mt-8">No messages yet. Say hello 👋</p>
                  ) : messages.map(m => (
                    <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.mine ? "bg-[#4D31EC] text-white" : "bg-gray-100 text-gray-800"}`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`mt-0.5 text-[10px] ${m.mine ? "text-white/60" : "text-gray-400"}`}>
                          {new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
                  <input value={draft} onChange={e => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#4D31EC] focus:ring-2 focus:ring-[#4D31EC]/10 transition-all" />
                  <button type="submit" disabled={sending || !draft.trim()}
                    className="rounded-full bg-[#4D31EC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5] disabled:opacity-40 transition-colors">
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
