import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
]

export default function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          Pulseboard
        </Link>

        <nav className="hidden gap-6 text-sm text-muted sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileNav links={links} />
      </div>
    </header>
  )
}
