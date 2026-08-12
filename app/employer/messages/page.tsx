"use client";

import { Suspense } from "react";
import MessagesView from "../../components/MessagesView";

export default function EmployerMessagesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F7F8FC]" />}>
      <MessagesView inboxUrl="/api/employer/messages" homeHref="/employer" homeLabel="Employer dashboard" />
    </Suspense>
  );
}
