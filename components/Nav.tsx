'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import MobileNav from '@/components/MobileNav'
import SignOutButton from '@/components/SignOutButton'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
]

export default function Nav() {
  const pathname = usePathname()

  if (pathname === '/') return null

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">Pulseboard</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 sm:flex">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'rounded-lg bg-plane px-3 py-1.5 text-sm font-medium text-ink'
                    : 'rounded-lg px-3 py-1.5 text-sm text-ink2 transition hover:bg-plane hover:text-ink'
                }
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <span className="flex items-center gap-2 rounded-full border border-hairline py-1 pl-1 pr-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/12 text-[11px] font-semibold text-ink">
              AO
            </span>
            <span className="text-sm text-ink2">Ada</span>
          </span>
          <SignOutButton />
        </div>

        <div className="ml-auto sm:hidden">
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  )
}
