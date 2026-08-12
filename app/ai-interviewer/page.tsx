import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AIInterviewer from '../../workcrew-ui/components/AIInterviewer';

export default async function AIInterviewerPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const user = session.user as { id?: string };
  const candidate = user.id
    ? await prisma.candidate.findUnique({ where: { userId: user.id }, select: { id: true } })
    : null;

  // Recruiter-initiated invite: only the invited candidate, only while still open.
  const { invite } = await searchParams;
  let inviteId: string | undefined;
  let jobId: string | undefined;
  let jobTitle: string | null = null;
  if (invite && candidate) {
    const rec = await prisma.aiInterview.findUnique({
      where: { id: invite },
      select: { id: true, candidateId: true, jobId: true, status: true, job: { select: { title: true } } },
    });
    if (rec && rec.candidateId === candidate.id && rec.status === 'invited') {
      inviteId = rec.id;
      jobId = rec.jobId ?? undefined;
      jobTitle = rec.job?.title ?? null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Technical Interview</h1>
          <p className="text-lg text-gray-600">
            {inviteId
              ? `Requested for ${jobTitle ?? 'a role'}. Submit your code to begin — the AI will ask adaptive follow-up questions.`
              : 'Experience a real technical interview with adaptive questioning based on your code'}
          </p>
        </div>
        <AIInterviewer candidateId={candidate?.id} jobId={jobId} inviteId={inviteId} />
      </div>
    </div>
  );
}
