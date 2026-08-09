import { describe, it, expect } from 'vitest'
import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 }

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await (scryptAsync as Function)(password, salt, 64, SCRYPT_PARAMS)) as Buffer
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${buf.toString('hex')}`
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const parts = hash.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, N, r, p, salt, stored] = parts
  const params = { N: parseInt(N), r: parseInt(r), p: parseInt(p) }
  if (!salt || !stored || isNaN(params.N)) return false
  const buf = (await (scryptAsync as Function)(plain, salt, 64, params)) as Buffer
  return timingSafeEqual(buf, Buffer.from(stored, 'hex'))
}

describe('password hashing', () => {
  it('produces the scrypt$ format', async () => {
    const hash = await hashPassword('hunter2')
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/)
  })

  it('verifies a correct password', async () => {
    const hash = await hashPassword('correct-horse-battery')
    expect(await verifyPassword('correct-horse-battery', hash)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct-horse-battery')
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })

  it('produces a different hash each time (unique salt)', async () => {
    const h1 = await hashPassword('same')
    const h2 = await hashPassword('same')
    expect(h1).not.toBe(h2)
  })

  it('rejects malformed hash gracefully', async () => {
    expect(await verifyPassword('anything', 'notahash')).toBe(false)
    expect(await verifyPassword('anything', '')).toBe(false)
  })
})
