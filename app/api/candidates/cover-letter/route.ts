import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

// POST — generate a cover letter draft for { jobId } from the candidate's profile.
// Not saved here; the draft is returned for the candidate to edit and send with their application.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  const [candidate, job] = await Promise.all([
    prisma.candidate.findUnique({
      where: { userId: session.user.id },
      select: {
        profileSummary: true, currentRole: true, totalExperience: true, primarySkills: true,
        user: { select: { name: true } },
      },
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true, description: true, organization: { select: { name: true } } },
    }),
  ]);
  if (!candidate) return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const skills: string[] = Array.isArray(candidate.primarySkills)
    ? candidate.primarySkills as string[]
    : Object.keys(candidate.primarySkills ?? {});

  const profile = {
    name: candidate.user.name ?? 'Candidate',
    currentRole: candidate.currentRole ?? '',
    experience: candidate.totalExperience ?? null,
    summary: candidate.profileSummary ?? '',
    skills,
  };

  const coverLetter = process.env.OPENAI_API_KEY
    ? await generateWithAI(profile, job).catch(() => template(profile, job))
    : template(profile, job);

  return NextResponse.json({ coverLetter });
}

type Profile = { name: string; currentRole: string; experience: number | null; summary: string; skills: string[] };
type JobLite = { title: string; description: string; organization: { name: string } };

async function generateWithAI(p: Profile, job: JobLite): Promise<string> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `Write a concise, professional cover letter (3 short paragraphs, max 250 words) for a job application. Use only facts provided about the candidate — do not invent employers, dates, or achievements. Warm but not effusive. No placeholders like [Your Name]; sign off with the candidate's name.`,
      },
      {
        role: 'user',
        content: `Candidate:
Name: ${p.name}
Current role: ${p.currentRole || 'n/a'}
Years of experience: ${p.experience ?? 'n/a'}
Summary: ${p.summary || 'n/a'}
Skills: ${p.skills.join(', ') || 'n/a'}

Job:
Title: ${job.title}
Company: ${job.organization.name}
Description: ${job.description.substring(0, 1500)}`,
      },
    ],
  });
  return completion.choices[0].message.content?.trim() || template(p, job);
}

function template(p: Profile, job: JobLite): string {
  const exp = p.experience ? `${p.experience} years of experience` : 'my experience';
  const skills = p.skills.slice(0, 5).join(', ');
  return `Dear ${job.organization.name} Hiring Team,

I'm excited to apply for the ${job.title} role. As ${p.currentRole ? `a ${p.currentRole}` : 'a professional'} with ${exp}, I believe my background aligns well with what you're looking for.

${p.summary || `I bring hands-on strength in ${skills || 'the core skills this role requires'}, and I'm drawn to the opportunity to contribute to your team.`}${skills ? ` My core skills include ${skills}.` : ''}

I'd welcome the chance to discuss how I can help ${job.organization.name} succeed. Thank you for your consideration.

Best regards,
${p.name}`;
}
