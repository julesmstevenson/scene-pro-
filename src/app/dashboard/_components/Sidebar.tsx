'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard/spectacles',
    label: 'Spectacles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/plan-de-salle',
    label: 'Plan de salle',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/revendeurs',
    label: 'Revendeurs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/dashboard/spectateurs',
    label: 'Spectateurs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/paiements',
    label: 'Paiements',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col w-60 shrink-0 min-h-screen"
      style={{ backgroundColor: '#0f0f1a' }}
    >
      {/* Logo */}
      <div className="px-6 py-7 border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="font-serif text-xl font-bold" style={{ color: '#C9A84C' }}>
            Scène
          </span>
          <span
            className="text-xs font-light tracking-[0.3em] uppercase mt-0.5"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Pro
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={
                isActive
                  ? {
                      color: '#C9A84C',
                      backgroundColor: 'rgba(201,168,76,0.1)',
                      borderLeft: '2px solid #C9A84C',
                      paddingLeft: '10px',
                    }
                  : {
                      color: 'rgba(255,255,255,0.5)',
                      borderLeft: '2px solid transparent',
                    }
              }
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Pied de sidebar */}
      <div
        className="px-6 py-4 border-t text-xs"
        style={{ borderColor: 'rgba(201,168,76,0.1)', color: 'rgba(255,255,255,0.2)' }}
      >
        Billetterie professionnelle
      </div>
    </aside>
  )
}
