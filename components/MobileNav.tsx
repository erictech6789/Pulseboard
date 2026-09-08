'use client'

import Link from 'next/link'
import { useState } from 'react'

type NavLink = { href: string; label: string }

export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-surface text-ink2 transition hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          {open ? (
            <path
              d="M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M2.5 4.5 H13.5 M2.5 8 H13.5 M2.5 11.5 H13.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-hairline bg-surface px-5 py-2 shadow-card">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-ink2 transition hover:bg-plane hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-hairline pt-2">
              <span className="block px-3 py-1 text-xs text-muted">Signed in as Ada</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
