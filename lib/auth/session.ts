import { createHmac, timingSafeEqual } from 'node:crypto'

const SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-me'

export const SESSION_COOKIE = 'pb_session'

function sign(value: string): string {
  return createHmac('sha256', SECRET).update(value).digest('hex')
}

export function createSession(userId: number): string {
  const payload = String(userId)
  return `${payload}.${sign(payload)}`
}

export function readSession(cookie: string | undefined): number | null {
  if (!cookie) return null

  const [payload, signature] = cookie.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload)
  if (signature.length !== expected.length) return null
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null

  const id = Number(payload)
  return Number.isInteger(id) ? id : null
}
