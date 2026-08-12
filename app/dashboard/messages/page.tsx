"use client";

import { Suspense } from "react";
import MessagesView from "../../components/MessagesView";

export default function CandidateMessagesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F7F8FC]" />}>
      <MessagesView inboxUrl="/api/messages" homeHref="/dashboard" homeLabel="Dashboard" />
    </Suspense>
  );
}
