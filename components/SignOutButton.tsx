'use client'

import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-lg px-2.5 py-1.5 text-sm text-ink2 transition hover:bg-plane hover:text-ink"
    >
      Sign out
    </button>
  )
}
