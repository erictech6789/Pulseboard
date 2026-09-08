import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { createSession, SESSION_COOKIE } from '@/lib/auth/session'

type LoginBody = { email?: string; password?: string }

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody
  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const db = getDb()
  const user = db
    .prepare(`SELECT id, password_hash FROM users WHERE email = ?`)
    .get(email) as { id: number; password_hash: string } | undefined

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, createSession(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
