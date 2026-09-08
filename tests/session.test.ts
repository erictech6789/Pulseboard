import { describe, expect, it } from 'vitest'
import { createSession, readSession } from '@/lib/auth/session'

describe('session cookies', () => {
  it('round-trips a user id', () => {
    expect(readSession(createSession(42))).toBe(42)
  })

  it('rejects a missing cookie', () => {
    expect(readSession(undefined)).toBeNull()
  })

  it('rejects a cookie with no signature', () => {
    expect(readSession('42')).toBeNull()
  })

  it('rejects a tampered user id', () => {
    const cookie = createSession(42)
    const [, signature] = cookie.split('.')
    expect(readSession(`99.${signature}`)).toBeNull()
  })
})
