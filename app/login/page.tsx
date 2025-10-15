"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<"candidate" | "employer">("candidate");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/onboarding/upload-resume");
  }

  return (
    <main className="flex min-h-screen">
      {/* LEFT */}
      <section className="hidden md:flex w-1/2 bg-[#4D31EC] text-white items-center justify-center px-12">
        <div className="max-w-md">
          <div className="mb-8">
            <Image src="/logo-workcrew-white.svg" alt="WorkCrew" width={160} height={36} />
          </div>

          <div className="bg-white/10 rounded-2xl p-6">
            <div className="bg-white rounded-xl p-6">
              <p className="font-semibold text-gray-700 mb-3">Resume Parser</p>
              <div className="border-2 border-dashed rounded-lg py-8 text-center text-gray-500">
                <span>⬆️ Upload Resume</span>
                <div className="text-xs mt-2">PDF, DOCX</div>
              </div>
              <div className="mt-4 text-gray-600 text-sm">resume.pdf</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-10">Smart resume parsing</h2>
          <p className="text-sm text-white/80 mt-2">
            AI smartly extracts and organizes your skills, experience, and achievements from any resume format.
          </p>

          <div className="flex gap-2 mt-8">
            <div className="h-1.5 w-16 bg-white rounded-full"></div>
            <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
            <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
            <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="w-full md:w-1/2 flex items-center justify-center px-8 md:px-24 py-16">
        <div className="w-full max-w-lg">
          <h1
            className="text-4xl font-semibold text-center"
            style={{ color: "#4D31EC" }}
          >
            Welcome!
          </h1>
          <p className="text-center text-gray-500 mt-2">Enter your credentials to login</p>

          {/* Role toggle */}
          <div className="flex justify-center gap-6 mt-6">
            <button
              onClick={() => setRole("candidate")}
              className={`px-8 py-2 rounded-md font-semibold transition ${
                role === "candidate" ? "bg-[#4D31EC] text-white" : "text-gray-800 hover:text-[#4D31EC]"
              }`}
            >
              Candidate
            </button>
            <button
              onClick={() => setRole("employer")}
              className={`px-8 py-2 rounded-md font-semibold transition ${
                role === "employer" ? "bg-[#4D31EC] text-white" : "text-gray-800 hover:text-[#4D31EC]"
              }`}
            >
              Employer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block mb-1 font-medium">Username</label>
              <input
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#4D31EC]" /> Remember me
              </label>
              <a className="text-[#4D31EC]" href="#">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4D31EC] text-white py-3 rounded-full font-semibold hover:bg-[#3b25b5]"
            >
              Login →
            </button>

            <p className="text-center text-gray-500">or continue with</p>

            <div className="flex justify-center gap-4">
              <button type="button" className="border rounded-full px-6 py-2">Google</button>
              <button type="button" className="border rounded-full px-6 py-2">Microsoft</button>
            </div>

            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-[#4D31EC] font-semibold">Sign up</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}