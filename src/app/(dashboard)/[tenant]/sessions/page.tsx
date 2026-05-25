import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { CalendarDays } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { formatDateTime, formatPrice } from '@/lib/utils'

type Props = { params: { tenant: string } }

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  SCHEDULED: { label: 'Programmée', class: 'bg-blue-50 text-blue-700'    },
  OPEN:      { label: 'Ouverte',    class: 'bg-green-50 text-green-700'  },
  SOLD_OUT:  { label: 'Complet',    class: 'bg-red-50 text-red-700'      },
  CANCELLED: { label: 'Annulée',    class: 'bg-gray-100 text-gray-500'   },
  COMPLETED: { label: 'Terminée',   class: 'bg-gray-100 text-gray-500'   },
}

export default async function SessionsPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) notFound()

  const sessions = await prisma.showSession.findMany({
    where: { show: { theaterId: theater.id } },
    include: {
      show: { select: { title: true, venue: { select: { name: true } } } },
      pricings: { include: { zone: { select: { name: true } } }, take: 2 },
      _count: { select: { reservations: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  return (
    <>
      <Header title="Séances" subtitle={`${sessions.length} séance${sessions.length !== 1 ? 's' : ''}`} />

      <div className="p-8">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Aucune séance. Commencez par créer un spectacle.
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const { label, class: cls } = STATUS_MAP[s.status] ?? { label: s.status, class: 'bg-gray-100 text-gray-500' }
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.show.title}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(s.startsAt)}</p>
                  </div>
                  <div className="hidden md:block text-sm text-gray-500">
                    {s.show.venue?.name ?? '—'}
                  </div>
                  <div className="text-sm text-gray-500 hidden lg:block">
                    {s.pricings.map((p) => (
                      <span key={p.id} className="mr-2 text-xs">{p.zone.name}: {formatPrice(p.price)}</span>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-gray-900 hidden sm:block">
                    {s._count.reservations} rés.
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
