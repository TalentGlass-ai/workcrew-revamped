"use client";

import { useRouter } from "next/navigation";
import React from "react";

function loadDraft<T = any>(): T {
  if (typeof window === "undefined") return {} as T;
  try { return JSON.parse(localStorage.getItem("wc_onboard") || "{}"); } catch { return {} as T; }
}
function saveDraft(patch: Record<string, any>) {
  if (typeof window === "undefined") return;
  const cur = loadDraft();
  localStorage.setItem("wc_onboard", JSON.stringify({ ...cur, ...patch }));
}

export default function PersonalDetailsPage() {
  const router = useRouter();
  const draft = loadDraft();

  const [form, setForm] = React.useState({
    firstName: draft.firstName || "",
    lastName: draft.lastName || "",
    email: draft.email || "",
    phoneCountry: draft.phoneCountry || "+91",
    phone: draft.phone || "",
    location: draft.location || "",
    linkedin: draft.linkedin || "",
    portfolio: draft.portfolio || "",
  });

  function next() {
    saveDraft(form);
    router.push("/onboarding/work-experience");
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT */}
      <section className="bg-[#F4F3FF] p-10 md:p-16">
        <h1 className="text-2xl font-semibold">Share your personal information</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Start by entering your personal details and your LinkedIn profile so we can correctly match you with the jobs that match your profile!
        </p>
      </section>

      {/* RIGHT */}
      <section className="p-10 md:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-[#4D31EC]">Personal details</h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">First name *</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="John"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Last name *</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="Doe"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="john.doe@example.com"
              />
            </div>

            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div>
                <label className="block mb-1 font-medium">Code</label>
                <select
                  value={form.phoneCountry}
                  onChange={(e) => setForm({ ...form, phoneCountry: e.target.value })}
                  className="w-full border rounded-lg px-3 py-3 outline-none focus:border-[#4D31EC]"
                >
                  <option>+91</option>
                  <option>+1</option>
                  <option>+44</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone number *</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="9876543210"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Location *</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="CA, San Francisco"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">LinkedIn profile</label>
              <input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Portfolio link</label>
              <input
                value={form.portfolio}
                onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="https://johndoe.com"
              />
            </div>
          </div>

          <div className="flex justify-end mt-10">
            <button onClick={next} className="bg-[#4D31EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b25b5]">
              Next →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
