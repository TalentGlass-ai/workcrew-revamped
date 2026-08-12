// Pure, dependency-free capability map — safe to import in both server routes
// and client components. The single source of truth for employer role gating.
//
// Roles (User.role): admin, recruiter, hiring_manager, interviewer.
// Any org member may VIEW; the map below gates mutating actions.

export const CAPABILITIES = {
  manageJobs:       ['admin', 'recruiter', 'hiring_manager'],
  managePipeline:   ['admin', 'recruiter', 'hiring_manager'],
  manageInterviews: ['admin', 'recruiter', 'hiring_manager', 'interviewer'],
  manageTeam:       ['admin', 'recruiter'],
} as const;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: string | null | undefined, cap: Capability): boolean {
  if (!role) return false;
  return (CAPABILITIES[cap] as readonly string[]).includes(role);
}
