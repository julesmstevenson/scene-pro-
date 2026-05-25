import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { formatPrice, formatDateTime } from '@/lib/utils'

type Props = { params: { tenant: string } }

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  PENDING:   { label: 'En attente',  class: 'bg-amber-50 text-amber-700'  },
  CONFIRMED: { label: 'Confirmée',   class: 'bg-green-50 text-green-700'  },
  CANCELLED: { label: 'Annulée',     class: 'bg-gray-100 text-gray-500'   },
  REFUNDED:  { label: 'Remboursée',  class: 'bg-blue-50 text-blue-700'    },
  EXPIRED:   { label: 'Expirée',     class: 'bg-red-50 text-red-600'      },
}

export default async function ReservationsPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) notFound()

  const reservations = await prisma.reservation.findMany({
    where: { session: { show: { theaterId: theater.id } } },
    include: {
      spectator: { select: { firstName: true, lastName: true, email: true } },
      session:   { include: { show: { select: { title: true } } } },
      _count:    { select: { tickets: true } },
      payment:   { select: { status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <>
      <Header title="Réservations" subtitle={`${reservations.length} réservation${reservations.length !== 1 ? 's' : ''}`} />

      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Réf</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Spectateur</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Spectacle</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date séance</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Places</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Montant</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">Aucune réservation</td>
                </tr>
              ) : reservations.map((r, i) => {
                const { label, class: cls } = STATUS_MAP[r.status] ?? { label: r.status, class: 'bg-gray-100 text-gray-500' }
                return (
                  <tr key={r.id} className={i < reservations.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{r.reference.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-3">
                      {r.spectator
                        ? <span className="font-medium">{r.spectator.firstName} {r.spectator.lastName}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-gray-700">{r.session.show.title}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDateTime(r.session.startsAt)}</td>
                    <td className="px-5 py-3 text-gray-700">{r._count.tickets}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{formatPrice(r.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                        {label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
