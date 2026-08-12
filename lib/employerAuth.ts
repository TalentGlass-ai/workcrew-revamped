import { auth } from '../auth';
import { prisma } from './prisma';
import { can, type Capability } from './capabilities';

// Server-side authorization for the employer area. The capability map itself
// lives in ./capabilities (dependency-free, shared with client components).
export { can } from './capabilities';
export type { Capability } from './capabilities';

export type EmployerActor = {
  userId: string;
  organizationId: string;
  role: string;
  name: string | null;
};

/** Resolve the signed-in employer, or null if not signed in / not in an org. */
export async function getEmployerActor(): Promise<EmployerActor | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, organizationId: true, role: true },
  });
  if (!user?.organizationId) return null;
  return { userId: user.id, organizationId: user.organizationId, role: user.role, name: user.name };
}

/**
 * Guard a mutating employer route. Returns the actor when allowed, or a
 * ready-to-return NextResponse-shaped error `{ status, error }` when not.
 * Callers: `const a = await requireCapability('manageJobs'); if ('status' in a) return NextResponse.json({error:a.error},{status:a.status});`
 */
export async function requireCapability(
  cap: Capability,
): Promise<EmployerActor | { status: number; error: string }> {
  const actor = await getEmployerActor();
  if (!actor) return { status: 401, error: 'Unauthorized' };
  if (!can(actor.role, cap)) return { status: 403, error: 'Your role does not permit this action' };
  return actor;
}
