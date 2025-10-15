"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/onboarding/upload-resume");
  }

  return (
    <main className="flex min-h-screen">
      {/* LEFT */}
      <section className="hidden md:flex w-1/2 bg-[#4D31EC] text-white items-center justify-center px-12">
        <div className="max-w-md">
          <Image src="/logo-workcrew-white.svg" alt="WorkCrew" width={160} height={36} className="mb-8" />
          <div className="bg-white/10 rounded-2xl p-6">
            <div className="bg-white rounded-xl p-6">
              <p className="font-semibold text-gray-700 mb-3">Resume Parser</p>
              <div className="border-2 border-dashed rounded-lg py-8 text-center text-gray-500">
                Extracting information…
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mt-10">Smart resume parsing</h2>
          <p className="text-sm text-white/80 mt-2">
            AI smartly extracts and organizes your skills, experience, and achievements from any resume format.
          </p>
          <div className="flex gap-2 mt-8">
            <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
            <div className="h-1.5 w-16 bg-white rounded-full"></div>
            <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="w-full md:w-1/2 flex items-center justify-center px-8 md:px-24 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-semibold text-center" style={{ color: "#4D31EC" }}>
            Create your account!
          </h1>
          <p className="text-center text-gray-500 mt-2">Enter your credentials to login</p>

          <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">First name</label>
              <input className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="Eg: John" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Last name</label>
              <input className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="Eg: Doe" required />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Email</label>
              <input type="email" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="john@example.com" required />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Password</label>
              <input type="password" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="Create your password" required />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Confirm password</label>
              <input type="password" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="Confirm your password" required />
            </div>

            <div className="md:col-span-2 space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#4D31EC]" required /> I agree to the Terms of Service and Privacy Policy
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#4D31EC]" /> Send me job recommendations and career tips
              </label>
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-[#4D31EC] text-white py-3 rounded-full font-semibold hover:bg-[#3b25b5]">
                Sign up →
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
