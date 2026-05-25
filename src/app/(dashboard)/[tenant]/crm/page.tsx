import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { formatPrice, formatDate } from '@/lib/utils'

type Props = { params: { tenant: string } }

const LEVEL_CONFIG = {
  BRONZE:   { label: 'Bronze',   class: 'bg-amber-100 text-amber-700'  },
  SILVER:   { label: 'Argent',   class: 'bg-gray-100 text-gray-600'    },
  GOLD:     { label: 'Or',       class: 'bg-yellow-100 text-yellow-700' },
  PLATINUM: { label: 'Platine',  class: 'bg-violet-100 text-violet-700' },
}

export default async function CrmPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) notFound()

  const spectators = await prisma.spectator.findMany({
    where: { theaterId: theater.id },
    include: {
      loyaltyAccount: true,
      _count: { select: { reservations: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const levelCounts = spectators.reduce<Record<string, number>>((acc, s) => {
    const level = s.loyaltyAccount?.level ?? 'BRONZE'
    acc[level] = (acc[level] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <Header title="CRM Spectateurs" subtitle={`${spectators.length} spectateur${spectators.length !== 1 ? 's' : ''}`} />

      <div className="p-8 space-y-6">
        {/* Loyalty breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const).map((level) => (
            <div key={level} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${LEVEL_CONFIG[level].class}`}>
                {LEVEL_CONFIG[level].label}
              </span>
              <p className="text-2xl font-bold text-gray-900">{levelCounts[level] ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Spectateur</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fidélité</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Points</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Dépenses</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Résas</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Depuis</th>
              </tr>
            </thead>
            <tbody>
              {spectators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">Aucun spectateur</td>
                </tr>
              ) : spectators.map((s, i) => {
                const level = (s.loyaltyAccount?.level ?? 'BRONZE') as keyof typeof LEVEL_CONFIG
                return (
                  <tr key={s.id} className={i < spectators.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_CONFIG[level].class}`}>
                        {LEVEL_CONFIG[level].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">{s.loyaltyAccount?.points ?? 0}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">
                      {formatPrice(s.loyaltyAccount?.totalSpent ?? 0)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">{s._count.reservations}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(s.createdAt)}</td>
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
