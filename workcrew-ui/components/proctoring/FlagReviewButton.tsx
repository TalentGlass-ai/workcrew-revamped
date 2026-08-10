"use client";

import { useState } from "react";

export function FlagReviewButton({
  flagId,
  initialReviewed,
}: {
  flagId: string;
  initialReviewed: boolean;
}) {
  const [reviewed, setReviewed] = useState(initialReviewed);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      const res = await fetch(`/api/assessment/flags/${flagId}`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setReviewed(data.reviewed);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        reviewed
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
          : "bg-[#4D31EC] text-white hover:bg-[#3b25b5]"
      }`}
    >
      {reviewed ? "✓ Reviewed" : "Mark reviewed"}
    </button>
  );
}
