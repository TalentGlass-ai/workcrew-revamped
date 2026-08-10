import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AIInterviewer from '../../workcrew-ui/components/AIInterviewer';

export default async function AIInterviewerPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const user = session.user as { id?: string };
  const candidate = user.id
    ? await prisma.candidate.findUnique({ where: { userId: user.id }, select: { id: true } })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Technical Interview</h1>
          <p className="text-lg text-gray-600">
            Experience a real technical interview with adaptive questioning based on your code
          </p>
        </div>
        <AIInterviewer candidateId={candidate?.id} />
      </div>
    </div>
  );
}
