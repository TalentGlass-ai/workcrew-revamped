import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// Zod schemas for our Onboarding Form Models
export const resumeSchema = z.object({
  fileName: z.string().nullable().optional(),
  wantsBuilder: z.boolean().default(false),
});

export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phoneCountry: z.string().min(1, 'Country code is required'),
  phone: z.string().min(6, 'Phone is too short').max(15, 'Phone is too long'),
  location: z.string().min(1, 'Location is required'),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const workExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  title: z.string().min(1, 'Job title is required'),
  start: z.string().min(1, 'Start date is required'),
  end: z.string().optional(),
  current: z.boolean(),
  bullets: z.string().min(10, 'Please provide some achievements/responsibilities'),
});

export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  year: z.string().min(4, 'Graduation year is required'),
  gpa: z.string().optional(),
});

export const professionalSummarySchema = z.object({
  summary: z.string().max(500, 'Summary cannot exceed 500 characters').optional().or(z.literal('')),
});

// Infer types from Zod schemas
export type ResumeData = z.infer<typeof resumeSchema>;
export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type ProfessionalSummary = z.infer<typeof professionalSummarySchema>;

export interface OnboardingState {
  resumeData: Partial<ResumeData>;
  personalDetails: Partial<PersonalDetails>;
  workExperience: Partial<WorkExperience>;
  education: Partial<Education>;
  professionalSummary: Partial<ProfessionalSummary>;
  
  // Actions
  updateResumeData: (data: Partial<ResumeData>) => void;
  updatePersonalDetails: (data: Partial<PersonalDetails>) => void;
  updateWorkExperience: (data: Partial<WorkExperience>) => void;
  updateEducation: (data: Partial<Education>) => void;
  updateProfessionalSummary: (data: Partial<ProfessionalSummary>) => void;
  clearOnboardingState: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      resumeData: {},
      personalDetails: {
        phoneCountry: '+91'
      },
      workExperience: {
        current: false
      },
      education: {},
      professionalSummary: {},
      
      updateResumeData: (data) => set((s) => ({ resumeData: { ...s.resumeData, ...data } })),
      updatePersonalDetails: (data) => set((s) => ({ personalDetails: { ...s.personalDetails, ...data } })),
      updateWorkExperience: (data) => set((s) => ({ workExperience: { ...s.workExperience, ...data } })),
      updateEducation: (data) => set((s) => ({ education: { ...s.education, ...data } })),
      updateProfessionalSummary: (data) => set((s) => ({ professionalSummary: { ...s.professionalSummary, ...data } })),

      clearOnboardingState: () =>
        set({
          resumeData: {},
          personalDetails: {},
          workExperience: {},
          education: {},
          professionalSummary: {},
        }),
    }),
    {
      name: 'wc-onboarding-storage', // key in local storage
    }
  )
);
