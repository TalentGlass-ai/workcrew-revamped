import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '../../../auth';
import { prisma } from '../../../lib/prisma';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF and Word documents are accepted' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File must be under 5 MB' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'pdf';
  const blob = await put(`resumes/${session.user.id}.${ext}`, file, {
    access: 'public',
  });

  await prisma.candidate.upsert({
    where: { userId: session.user.id },
    update: { resumeUrl: blob.url },
    create: {
      userId: session.user.id,
      resumeUrl: blob.url,
      primarySkills: [],
      skillClusters: [],
    },
  });

  return NextResponse.json({ url: blob.url });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.user.id },
    select: { resumeUrl: true },
  });

  if (candidate?.resumeUrl) {
    await del(candidate.resumeUrl).catch(() => null);
    await prisma.candidate.update({
      where: { userId: session.user.id },
      data: { resumeUrl: null },
    });
  }

  return NextResponse.json({ ok: true });
}
