// Shared resume text extraction + structured parsing

export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  currentRole: string;
  totalExperience: number | null;
  skills: string[];
  experience: { title: string; company: string; duration: string }[];
};

// ── Text extraction ───────────────────────────────────────────────────────────

export function extractText(buffer: Buffer, mimeType: string): string {
  const raw = buffer.toString('latin1');

  if (mimeType === 'application/pdf') {
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

  return (raw.match(/[\x20-\x7E]{4,}/g) ?? [])
    .filter(s => /[a-zA-Z]/.test(s))
    .join(' ')
    .substring(0, 8000);
}

// ── Regex fallback ────────────────────────────────────────────────────────────

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

export function parseWithRegex(text: string): ParsedResume {
  const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(?:\+?\d[\s\-().]*){7,15}\d/);
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|\w+)/);
  const summaryMatch = text.match(/(?:summary|objective|profile)[:\s]+([^.]+(?:\.[^.]+){0,2})/i);

  const name = lines.find(l => {
    const words = l.split(/\s+/);
    return words.length >= 2 && words.length <= 4 &&
      words.every(w => /^[A-Z]/.test(w)) &&
      !l.includes('@') && !/\d/.test(l) &&
      !HEADER_WORDS.has(l.toLowerCase());
  }) ?? '';

  const skills = KNOWN_SKILLS.filter(s => text.toLowerCase().includes(s.toLowerCase()));

  return {
    name,
    email: emailMatch?.[0] ?? '',
    phone: phoneMatch?.[0]?.trim() ?? '',
    location: locationMatch?.[0] ?? '',
    summary: (summaryMatch?.[1]?.trim() ?? '').substring(0, 300),
    currentRole: '',
    totalExperience: null,
    skills,
    experience: [],
  };
}

// ── OpenAI parser ─────────────────────────────────────────────────────────────

export async function parseWithAI(text: string): Promise<ParsedResume> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Extract structured data from a resume. Return JSON with these exact keys:
name (string), email (string), phone (string), location (string, city/country),
summary (string, max 300 chars), currentRole (string, most recent job title),
totalExperience (number of years as integer, null if unclear),
skills (string array, max 20), experience (array of {title, company, duration}).`,
      },
      { role: 'user', content: `Resume:\n\n${text.substring(0, 4000)}` },
    ],
  });

  const raw = JSON.parse(completion.choices[0].message.content ?? '{}');
  return {
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    location: raw.location ?? '',
    summary: (raw.summary ?? '').substring(0, 300),
    currentRole: raw.currentRole ?? '',
    totalExperience: typeof raw.totalExperience === 'number' ? raw.totalExperience : null,
    skills: Array.isArray(raw.skills) ? raw.skills.slice(0, 20) : [],
    experience: Array.isArray(raw.experience) ? raw.experience : [],
  };
}

export async function parseResume(buffer: Buffer, mimeType: string): Promise<ParsedResume> {
  const text = extractText(buffer, mimeType);
  if (process.env.OPENAI_API_KEY) {
    return parseWithAI(text).catch(() => parseWithRegex(text));
  }
  return parseWithRegex(text);
}
