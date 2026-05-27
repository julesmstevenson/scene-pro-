'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard/spectacles',
    label: 'Spectacles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/artistes',
    label: 'Artistes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/plan-de-salle',
    label: 'Plan de salle',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/spectateurs',
    label: 'Spectateurs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/revendeurs',
    label: 'Revendeurs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/dashboard/paiements',
    label: 'Paiements',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 shrink-0 min-h-screen bg-white border-r border-gray-100">

      {/* Logo */}
      <div className="px-6 pt-8 pb-7">
        <Link href="/dashboard" className="block group">
          <p
            className="font-serif text-[22px] font-bold leading-none tracking-tight"
            style={{ color: '#8B1A1A' }}
          >
            Scène
          </p>
          <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mt-1.5 font-medium">
            Pro
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-px">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={
                isActive
                  ? {
                      color: '#8B1A1A',
                      backgroundColor: 'rgba(139,26,26,0.055)',
                      fontWeight: 600,
                    }
                  : {
                      color: '#b0b7c3',
                      fontWeight: 500,
                    }
              }
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-200">
          Billetterie pro
        </p>
      </div>

    </aside>
  )
}
