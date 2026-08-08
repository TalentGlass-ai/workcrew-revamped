import Link from "next/link";

export const metadata = { title: "Page not found | WorkCrew.ai" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-bold text-[#4D31EC]">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#4D31EC] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3b25b5] transition"
      >
        ← Back to home
      </Link>
    </main>
  );
}
