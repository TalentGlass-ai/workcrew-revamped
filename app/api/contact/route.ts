import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  company: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(200),
  email: z.string().email(),
  countryCode: z.string().min(1).max(10),
  phone: z.string().min(5).max(20),
  companySize: z.string().min(1),
  role: z.string().min(1),
  desc: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // ponytail: log to console — wire to email/CRM when ready
  console.log("Contact form submission:", parsed.data);

  return NextResponse.json({ ok: true });
}
