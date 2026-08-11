"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Stepper, { Step } from "../Stepper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore, educationSchema, type Education } from "@/components/../lib/stores/onboardingStore";

const STEPS: Step[] = [
  { key: "personal",  label: "Personal details" },
  { key: "work",      label: "Work experience" },
  { key: "summary",   label: "Professional summary" },
  { key: "education", label: "Education" },
  { key: "skills",    label: "Skills" },
];

export default function EducationPage() {
  const router = useRouter();
  const { education, updateEducation } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Education>({
    resolver: zodResolver(educationSchema),
    defaultValues: education,
  });

  useEffect(() => {
    reset(education);
  }, [education, reset]);

  const onSubmit = (data: Education) => {
    updateEducation(data);
    router.push("/onboarding/professional-summary");
  };

  const handlePrev = () => {
    const data = watch();
    updateEducation(data);
    router.back();
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="bg-[#F4F3FF] p-10 md:p-16">
         <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
           <Stepper steps={STEPS} active={3} />
         </div>
        <h1 className="text-2xl font-semibold">Add details of your education</h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Showcasing your education helps employers understand your qualifications and makes your profile stand out.
        </p>
      </section>

      <section className="p-10 md:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-center text-[#4D31EC]">Education</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Institution name *</label>
              <input
                {...register("institution")}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: National Institute of Technology"
              />
              {errors.institution && <p className="text-sm text-red-500 mt-1">{errors.institution.message}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Degree *</label>
              <input
                {...register("degree")}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: Bachelor of Science"
              />
              {errors.degree && <p className="text-sm text-red-500 mt-1">{errors.degree.message}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Field of study *</label>
              <input
                {...register("field")}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: Computer science"
              />
              {errors.field && <p className="text-sm text-red-500 mt-1">{errors.field.message}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Graduation year *</label>
              <input
                {...register("year")}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: 2020"
              />
              {errors.year && <p className="text-sm text-red-500 mt-1">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">GPA</label>
              <input
                {...register("gpa")}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-[#4D31EC]" placeholder="eg: 8.3"
              />
              {errors.gpa && <p className="text-sm text-red-500 mt-1">{errors.gpa.message}</p>}
            </div>

            <div className="md:col-span-2 flex justify-between mt-8">
              <button type="button" onClick={handlePrev} className="px-6 py-3 rounded-full border hover:border-[#4D31EC]">← Previous</button>
              <button type="submit" className="bg-[#4D31EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#3b25b5]">Next →</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
