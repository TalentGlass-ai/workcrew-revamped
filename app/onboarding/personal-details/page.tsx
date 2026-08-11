"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect } from "react";
import Stepper, { Step } from "../Stepper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboardingStore, personalDetailsSchema, type PersonalDetails } from "@/components/../lib/stores/onboardingStore";

const STEPS: Step[] = [
  { key: "personal",  label: "Personal details" },
  { key: "work",      label: "Work experience" },
  { key: "summary",   label: "Professional summary" },
  { key: "education", label: "Education" },
  { key: "skills",    label: "Skills" },
];

export default function PersonalDetailsPage() {
  const router = useRouter();
  const { personalDetails, updatePersonalDetails } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: personalDetails.firstName || '',
      lastName: personalDetails.lastName || '',
      email: personalDetails.email || '',
      phoneCountry: personalDetails.phoneCountry || '+91',
      phone: personalDetails.phone || '',
      location: personalDetails.location || '',
      linkedin: personalDetails.linkedin || '',
      portfolio: personalDetails.portfolio || '',
    },
  });

  useEffect(() => {
    reset(personalDetails);
  }, [personalDetails, reset]);

  const onSubmit = (data: PersonalDetails) => {
    updatePersonalDetails(data);
    router.push("/onboarding/work-experience");
  };

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <section className="relative flex flex-col justify-center bg-[#F6F5FF] px-10 py-16 md:px-20">
        <Image
          src="/logo.png"
          alt="WorkCrew.ai"
          width={116}
          height={21}
          className="absolute left-[50px] top-[50px]"
          priority
        />
        <div className="mt-10 flex flex-col items-center justify-center space-y-6 md:items-start">
          <Image
            src="/cuate.png"
            alt="Personal details illustration"
            width={180}
            height={180}
            className="object-contain"
            priority
          />
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-semibold text-black">
              Share your personal information
            </h1>
            <p className="mt-3 max-w-md text-sm md:text-base text-gray-600">
              Start by entering your personal details and your LinkedIn profile so we can correctly
              match you with the jobs that match your profile!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/onboarding/work-experience")}
          className="absolute bottom-[30px] left-[50px] text-sm text-gray-400 hover:text-gray-600"
        >
          Skip for now
        </button>
      </section>

      <section className="flex items-start justify-center px-6 py-10 md:px-12 md:py-16">
        <div className="w-full max-w-4xl">
          <div className="mx-auto mb-8 mt-2 w-full max-w-3xl">
            <Stepper steps={STEPS} active={0} />
          </div>

          <h2 className="mb-8 text-center text-2xl font-semibold text-[#4D31EC]">
            Personal details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName")}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="John"
              />
              {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName")}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="john.doe@example.com"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Code</label>
                <select
                  {...register("phoneCountry")}
                  className="w-full rounded-lg border px-3 py-3 outline-none focus:border-[#4D31EC]"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("phone")}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                  placeholder="9876543210"
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                {...register("location")}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="CA, San Fransisco"
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">LinkedIn profile</label>
              <input
                {...register("linkedin")}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="https://linkedin.com/in/johndoe"
              />
              {errors.linkedin && <p className="text-sm text-red-500 mt-1">{errors.linkedin.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Portfolio link</label>
              <input
                {...register("portfolio")}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#4D31EC]"
                placeholder="https://johndoe.com"
              />
              {errors.portfolio && <p className="text-sm text-red-500 mt-1">{errors.portfolio.message}</p>}
            </div>

            <div className="md:col-span-2 mx-auto mt-10 w-full max-w-3xl flex justify-center">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-[#4D31EC] px-8 py-3 font-semibold text-white hover:bg-[#3b25b5]"
              >
                <span>Next</span> <span aria-hidden>→</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
