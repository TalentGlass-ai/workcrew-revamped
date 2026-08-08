import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';

// ── Text extraction ───────────────────────────────────────────────────────────
function extractText(buffer: Buffer, mimeType: string): string {
  const raw = buffer.toString('latin1');

  if (mimeType === 'application/pdf') {
    // Extract strings from PDF text operators: (text)Tj / [(text)]TJ
    const chunks: string[] = [];
    const btEt = /BT([\s\S]*?)ET/g;
    let block;
    while ((block = btEt.exec(raw)) !== null) {
      const strRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*T[Jj]/g;
      let m;
      while ((m = strRe.exec(block[1])) !== null) {
        const t = m[1]
          .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
        if (t.trim()) chunks.push(t);
      }
    }
    if (chunks.length > 0) return chunks.join(' ').substring(0, 8000);
  }

  // Generic fallback: printable ASCII runs (works for plain-text resumes, partial for docx)
  return (raw.match(/[\x20-\x7E]{4,}/g) ?? [])
    .filter(s => /[a-zA-Z]/.test(s))
    .join(' ')
    .substring(0, 8000);
}

// ── Regex fallback parser ─────────────────────────────────────────────────────
const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Git', 'HTML', 'CSS', 'SQL', 'REST APIs', 'GraphQL', 'Machine Learning',
  'TensorFlow', 'PyTorch', 'CI/CD', 'Agile', 'Scrum',
];

const HEADER_WORDS = new Set([
  'resume', 'cv', 'curriculum', 'vitae', 'profile', 'objective', 'summary',
  'experience', 'education', 'skills', 'contact', 'references',
]);

function parseWithRegex(text: string) {
  const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(?:\+?\d[\s\-().]*){7,15}\d/);

  const name = lines.find(l => {
    const words = l.split(/\s+/);
    return (
      words.length >= 2 && words.length <= 4 &&
      words.every(w => /^[A-Z]/.test(w)) &&
      !l.includes('@') && !/\d/.test(l) &&
      !HEADER_WORDS.has(l.toLowerCase())
    );
  }) ?? '';

  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|\w+)/);
  const summaryMatch = text.match(/(?:summary|objective|profile)[:\s]+([^.]+(?:\.[^.]+){0,2})/i);
  const textLower = text.toLowerCase();

  return {
    name,
    email: emailMatch?.[0] ?? '',
    phone: phoneMatch?.[0]?.trim() ?? '',
    location: locationMatch?.[0] ?? '',
    summary: (summaryMatch?.[1]?.trim() ?? '').substring(0, 300),
    skills: KNOWN_SKILLS.filter(s => textLower.includes(s.toLowerCase())),
    experience: [],
    education: [],
  };
}

// ── OpenAI parser ─────────────────────────────────────────────────────────────
async function parseWithOpenAI(text: string) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Extract structured data from resume text. Return valid JSON only with these exact keys: name, email, phone, location, summary, skills (array), experience (array of {title,company,duration,description}), education (array of {degree,institution,year}).',
      },
      {
        role: 'user',
        content: `Resume:\n\n${text.substring(0, 4000)}`,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content ?? '{}');
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = extractText(buffer, file.type);

    const parsedData = process.env.OPENAI_API_KEY
      ? await parseWithOpenAI(text)
      : parseWithRegex(text);

    return NextResponse.json({ success: true, parsedData, fileName: file.name, fileSize: file.size });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
