import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'

describe('password hashing', () => {
  it('accepts the correct password', () => {
    const stored = hashPassword('correct horse')
    expect(verifyPassword('correct horse', stored)).toBe(true)
  })

  it('rejects the wrong password', () => {
    const stored = hashPassword('correct horse')
    expect(verifyPassword('wrong horse', stored)).toBe(false)
  })

  it('salts each hash separately', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'))
  })

  it('rejects a malformed stored value', () => {
    expect(verifyPassword('anything', 'not-a-real-hash')).toBe(false)
  })
})
