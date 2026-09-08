'use client'

import Link from 'next/link'
import { useState } from 'react'

type NavLink = { href: string; label: string }

export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded border border-slate-300 px-3 py-1.5 text-sm"
      >
        Menu
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <ul className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block py-1">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
