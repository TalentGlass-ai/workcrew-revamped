"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Something went wrong</h1>
          <p className="mt-2 text-gray-500">We've been notified and are looking into it.</p>
          <button
            onClick={reset}
            className="mt-6 rounded-full bg-[#4D31EC] px-6 py-2 text-sm font-semibold text-white hover:bg-[#3b25b5]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
