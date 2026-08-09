import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Signup schema (mirrors app/api/auth/signup/route.ts)
const signupSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().transform((e) => e.trim().toLowerCase()),
  password: z.string().min(8).max(128),
})

// Contact schema (mirrors app/api/contact/route.ts)
const contactSchema = z.object({
  company: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(200),
  email: z.string().email(),
  countryCode: z.string().min(1).max(10),
  phone: z.string().min(5).max(20),
  companySize: z.string().min(1),
  role: z.string().min(1),
  desc: z.string().max(2000).optional(),
})

// Forgot-password schema
const forgotSchema = z.object({ email: z.string().email() })

describe('signup schema', () => {
  it('accepts valid input', () => {
    const r = signupSchema.safeParse({ firstName: 'Jane', lastName: 'Doe', email: 'JANE@example.com', password: 'hunter2!' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBe('jane@example.com') // lowercased
  })

  it('rejects short password', () => {
    expect(signupSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'short' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(signupSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'not-an-email', password: 'validpassword' }).success).toBe(false)
  })

  it('rejects empty firstName', () => {
    expect(signupSchema.safeParse({ firstName: '', lastName: 'B', email: 'a@b.com', password: 'validpassword' }).success).toBe(false)
  })
})

describe('contact schema', () => {
  const valid = { company: 'Acme', contactPerson: 'Bob', email: 'bob@acme.com', countryCode: '+1', phone: '5551234', companySize: '10-50', role: 'CTO' }

  it('accepts valid input', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional desc', () => {
    expect(contactSchema.safeParse({ ...valid, desc: 'Hello' }).success).toBe(true)
  })

  it('rejects desc over 2000 chars', () => {
    expect(contactSchema.safeParse({ ...valid, desc: 'x'.repeat(2001) }).success).toBe(false)
  })

  it('rejects short phone', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '123' }).success).toBe(false)
  })
})

describe('forgot-password schema', () => {
  it('accepts valid email', () => {
    expect(forgotSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(forgotSchema.safeParse({ email: 'notanemail' }).success).toBe(false)
  })

  it('rejects missing email', () => {
    expect(forgotSchema.safeParse({}).success).toBe(false)
  })
})
