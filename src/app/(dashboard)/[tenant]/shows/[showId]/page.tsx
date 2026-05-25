import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { ArrowLeft, Plus, CalendarDays } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { formatDateTime, formatPrice } from '@/lib/utils'

type Props = { params: { tenant: string; showId: string } }

export default async function ShowDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const show = await prisma.show.findFirst({
    where: {
      id: params.showId,
      theater: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
    },
    include: {
      venue: true,
      sessions: {
        include: {
          pricings: { include: { zone: { select: { name: true } } } },
          _count: { select: { reservations: true } },
        },
        orderBy: { startsAt: 'asc' },
      },
    },
  })

  if (!show) notFound()

  return (
    <>
      <Header title={show.title} subtitle={show.genre ?? 'Spectacle'} />

      <div className="p-8 space-y-6">
        <Link
          href={`/${params.tenant}/shows`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux spectacles
        </Link>

        {/* Show meta */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Durée</p>
            <p className="font-medium">{show.duration ? `${show.duration} min` : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Public</p>
            <p className="font-medium">{show.ageRating ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Salle</p>
            <p className="font-medium">{show.venue?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Statut</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              show.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {show.isPublished ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        </div>

        {/* Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Séances ({show.sessions.length})
            </h2>
            <Link
              href={`/${params.tenant}/sessions?showId=${show.id}`}
              className="flex items-center gap-1.5 text-sm bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une séance
            </Link>
          </div>

          {show.sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              Aucune séance programmée
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tarifs</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Réservations</th>
                  </tr>
                </thead>
                <tbody>
                  {show.sessions.map((s, i) => (
                    <tr key={s.id} className={i < show.sessions.length - 1 ? 'border-b border-gray-50' : ''}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-300" />
                          <span className="text-gray-900">{formatDateTime(s.startsAt)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {s.pricings.slice(0, 2).map((p) => (
                          <span key={p.id} className="mr-2">{p.zone.name}: {formatPrice(p.price)}</span>
                        ))}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">{s._count.reservations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    SCHEDULED: { label: 'Programmée',  class: 'bg-blue-50 text-blue-700'   },
    OPEN:      { label: 'Ouverte',     class: 'bg-green-50 text-green-700' },
    SOLD_OUT:  { label: 'Complet',     class: 'bg-red-50 text-red-700'     },
    CANCELLED: { label: 'Annulée',     class: 'bg-gray-100 text-gray-500'  },
    COMPLETED: { label: 'Terminée',    class: 'bg-gray-100 text-gray-500'  },
  }
  const { label, class: cls } = map[status] ?? { label: status, class: 'bg-gray-100 text-gray-500' }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
}
