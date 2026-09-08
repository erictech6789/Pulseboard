import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEYLEN = 64

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(plain, salt, KEYLEN).toString('hex')
  return `${salt}:${derived}`
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, derived] = stored.split(':')
  if (!salt || !derived) return false

  const candidate = scryptSync(plain, salt, KEYLEN)
  const expected = Buffer.from(derived, 'hex')
  if (candidate.length !== expected.length) return false

  return timingSafeEqual(candidate, expected)
}
