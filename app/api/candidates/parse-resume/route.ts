import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { parseResume } from '../../../../lib/parseResume';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'PDF or Word only' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseResume(buffer, file.type);

  return NextResponse.json({ parsed });
}
