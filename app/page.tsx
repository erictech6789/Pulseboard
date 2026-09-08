'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setPending(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Login failed' }))
      setError(body.error ?? 'Login failed')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-[22rem]">
        <div className="flex flex-col items-center text-center">
          <Logo size={40} />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Sign in to Pulseboard</h1>
          <p className="mt-1 text-sm text-ink2">See what your team has been up to.</p>
        </div>

        <form onSubmit={onSubmit} className="card mt-6 flex flex-col gap-4 p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="field"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="field"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-hairline bg-plane px-3 py-2 text-sm text-ink">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-ink px-3 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Demo account: ada@pulseboard.dev / password123
        </p>
      </div>
    </div>
  )
}
