"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Stepper, { Step } from "../Stepper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore, professionalSummarySchema, type ProfessionalSummary } from "@/components/../lib/stores/onboardingStore";

const STEPS: Step[] = [
  { key: "personal",  label: "Personal details" },
  { key: "work",      label: "Work experience" },
  { key: "summary",   label: "Professional summary" },
  { key: "education", label: "Education" },
];

export default function ProfessionalSummaryPage() {
  const router = useRouter();
  const { professionalSummary, updateProfessionalSummary } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfessionalSummary>({
    resolver: zodResolver(professionalSummarySchema),
    defaultValues: professionalSummary,
  });

  const summaryVal = watch("summary") || "";

  useEffect(() => {
    reset(professionalSummary);
  }, [professionalSummary, reset]);

  const onSubmit = (data: ProfessionalSummary) => {
    updateProfessionalSummary(data);
    router.push("/onboarding/review");
  };

  const handlePrev = () => {
    const data = watch();
    updateProfessionalSummary(data);
    router.back();
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="bg-[#F4F3FF] p-10 md:p-16">
        <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
           <Stepper steps={STEPS} active={2} />
        </div>
        <h1 className="text-2xl font-semibold">Form your professional summary</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Add a professional summary to showcase your strengths, career goals, and what makes you stand out to employers.
        </p>
      </section>

      <section className="p-10 md:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-[#4D31EC]">Professional summary</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            <textarea
              rows={10}
              {...register("summary")}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#4D31EC]"
              placeholder="Write a compelling summary that highlights your professional background, key insights and career objectives…"
            />
            <div className="flex justify-between items-start mt-1">
              <div>
                 {errors.summary && <p className="text-sm text-red-500">{errors.summary.message}</p>}
              </div>
              <div className="text-right text-sm text-gray-500">{summaryVal.length}/500</div>
            </div>

            <div className="flex justify-between mt-8">
              <button type="button" onClick={handlePrev} className="px-6 py-3 rounded-full border hover:border-[#4D31EC]">← Previous</button>
              <button type="submit" className="bg-[#4D31EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b25b5]">Next →</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
