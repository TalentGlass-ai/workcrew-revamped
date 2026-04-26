'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Assessment from '../../../components/Assessment';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const handleComplete = () => {
    router.push(`/assessment/${assessmentId}/results`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Assessment assessmentId={assessmentId} onComplete={handleComplete} />
    </div>
  );
}