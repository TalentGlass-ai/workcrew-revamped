import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import after mocking time so the module picks up the mock clock
let rateLimit: (key: string, limit: number, windowMs: number) => boolean

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  const mod = await import('../lib/rateLimiter')
  rateLimit = mod.rateLimit
})

describe('rateLimit', () => {
  it('allows requests within the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit('test-key', 5, 60_000)).toBe(true)
    }
  })

  it('blocks the (limit+1)th request', () => {
    for (let i = 0; i < 5; i++) rateLimit('block-key', 5, 60_000)
    expect(rateLimit('block-key', 5, 60_000)).toBe(false)
  })

  it('resets after the window expires', () => {
    for (let i = 0; i < 5; i++) rateLimit('reset-key', 5, 60_000)
    vi.advanceTimersByTime(60_001)
    expect(rateLimit('reset-key', 5, 60_000)).toBe(true)
  })

  it('tracks keys independently', () => {
    for (let i = 0; i < 5; i++) rateLimit('key-a', 5, 60_000)
    expect(rateLimit('key-a', 5, 60_000)).toBe(false)
    expect(rateLimit('key-b', 5, 60_000)).toBe(true)
  })
})
