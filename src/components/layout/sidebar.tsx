'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Clapperboard, CalendarDays, Ticket,
  Network, Users, Settings, Ticket as TicketIcon, LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = (tenant: string) => [
  { href: `/${tenant}`,              icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: `/${tenant}/shows`,        icon: Clapperboard,    label: 'Spectacles'      },
  { href: `/${tenant}/sessions`,     icon: CalendarDays,    label: 'Séances'         },
  { href: `/${tenant}/reservations`, icon: Ticket,          label: 'Réservations'    },
  { href: `/${tenant}/resellers`,    icon: Network,         label: 'Revendeurs'      },
  { href: `/${tenant}/crm`,         icon: Users,           label: 'CRM'             },
  { href: `/${tenant}/settings`,     icon: Settings,        label: 'Paramètres'      },
]

type Props = { tenant: string; theaterName: string }

export function Sidebar({ tenant, theaterName }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-gray-950 text-white shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
          <TicketIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 truncate">Scène Pro</p>
          <p className="text-sm font-semibold truncate">{theaterName}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems(tenant).map(({ href, icon: Icon, label }) => {
          const isActive = href === `/${tenant}` ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
