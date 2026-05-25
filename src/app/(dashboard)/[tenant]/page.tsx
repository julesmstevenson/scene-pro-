import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Ticket, CalendarDays, Users, TrendingUp } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { formatPrice, formatDateTime } from '@/lib/utils'

type Props = { params: { tenant: string } }

async function DashboardStats({ tenant }: { tenant: string }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const theater = await prisma.theater.findFirst({
    where: { slug: tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) notFound()

  const [showCount, sessionCount, spectatorCount, revenueResult, upcomingSessions] = await Promise.all([
    prisma.show.count({ where: { theaterId: theater.id } }),
    prisma.showSession.count({ where: { show: { theaterId: theater.id } } }),
    prisma.spectator.count({ where: { theaterId: theater.id } }),
    prisma.payment.aggregate({
      where: {
        status: 'PAID',
        reservation: { session: { show: { theaterId: theater.id } } },
      },
      _sum: { amount: true },
    }),
    prisma.showSession.findMany({
      where: {
        show: { theaterId: theater.id },
        startsAt: { gte: new Date() },
        status: { not: 'CANCELLED' },
      },
      include: {
        show: { select: { title: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: { startsAt: 'asc' },
      take: 5,
    }),
  ])

  const totalRevenue = revenueResult._sum.amount ?? 0

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-8 pb-0">
        <StatsCard
          title="Spectacles"
          value={showCount}
          icon={Ticket}
          color="brand"
        />
        <StatsCard
          title="Séances"
          value={sessionCount}
          icon={CalendarDays}
          color="green"
        />
        <StatsCard
          title="Spectateurs"
          value={spectatorCount}
          icon={Users}
          color="amber"
        />
        <StatsCard
          title="Revenus totaux"
          value={formatPrice(totalRevenue)}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Upcoming sessions */}
      <div className="p-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Prochaines séances</h2>
        {upcomingSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Aucune séance à venir
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Spectacle</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Réservations</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((s, i) => (
                  <tr key={s.id} className={i < upcomingSessions.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="px-5 py-3 font-medium text-gray-900">{s.show.title}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDateTime(s.startsAt)}</td>
                    <td className="px-5 py-3 text-right text-gray-900">{s._count.reservations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default function TenantDashboard({ params }: Props) {
  return (
    <>
      <Header title="Tableau de bord" subtitle="Vue d'ensemble de votre activité" />
      <Suspense fallback={<div className="p-8 text-sm text-gray-400">Chargement…</div>}>
        <DashboardStats tenant={params.tenant} />
      </Suspense>
    </>
  )
}
