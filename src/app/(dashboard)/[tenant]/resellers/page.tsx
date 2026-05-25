import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { formatDate } from '@/lib/utils'

type Props = { params: { tenant: string } }

export default async function ResellersPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) notFound()

  const contracts = await prisma.resellerContract.findMany({
    where: { theaterId: theater.id },
    include: {
      reseller: true,
      quotas:   { include: { session: { include: { show: { select: { title: true } } } } } },
      _count:   { select: { reservations: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Revendeurs" subtitle={`${contracts.length} contrat${contracts.length !== 1 ? 's' : ''} actif${contracts.length !== 1 ? 's' : ''}`} />

      <div className="p-8 space-y-4">
        {contracts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Aucun partenaire revendeur
          </div>
        ) : contracts.map((contract) => {
          const totalAllocated = contract.quotas.reduce((s, q) => s + q.allocated, 0)
          const totalSold      = contract.quotas.reduce((s, q) => s + q.sold, 0)

          return (
            <div key={contract.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{contract.reseller.name}</h3>
                  <p className="text-sm text-gray-500">{contract.reseller.email}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    contract.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                    contract.status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {contract.status === 'ACTIVE' ? 'Actif' : contract.status === 'SUSPENDED' ? 'Suspendu' : 'Résilié'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Commission</p>
                  <p className="font-semibold text-gray-900">{contract.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Depuis</p>
                  <p className="font-medium text-gray-700">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Quotas alloués</p>
                  <p className="font-semibold text-gray-900">{totalAllocated}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Vendus</p>
                  <p className="font-semibold text-gray-900">
                    {totalSold}
                    {totalAllocated > 0 && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({Math.round((totalSold / totalAllocated) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {contract.quotas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Quotas par séance</p>
                  <div className="space-y-2">
                    {contract.quotas.map((q) => (
                      <div key={q.id} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 flex-1">{q.session.show.title}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 bg-brand-500 rounded-full"
                              style={{ width: `${Math.min(100, (q.sold / q.allocated) * 100)}%` }}
                            />
                          </div>
                          <span>{q.sold}/{q.allocated}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
