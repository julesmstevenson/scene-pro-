import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'

type Props = { params: { tenant: string } }

export default async function SettingsPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
    include: { memberships: { include: { user: { select: { id: true, name: true, email: true } } } } },
  })
  if (!theater) notFound()

  return (
    <>
      <Header title="Paramètres" subtitle={theater.name} />

      <div className="p-8 space-y-6 max-w-2xl">
        {/* Theater info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Informations du théâtre</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-1">Nom</p>
              <p className="font-medium text-gray-900">{theater.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Identifiant URL</p>
              <p className="font-mono text-gray-700">{theater.slug}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-gray-700">{theater.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Téléphone</p>
              <p className="text-gray-700">{theater.phone ?? '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-1">Adresse</p>
              <p className="text-gray-700">
                {[theater.address, theater.postalCode, theater.city].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Équipe</h2>
          <div className="space-y-3">
            {theater.memberships.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.user.name ?? m.user.email}</p>
                  <p className="text-xs text-gray-400">{m.user.email}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {m.role === 'OWNER' ? 'Propriétaire' : m.role === 'ADMIN' ? 'Admin' : m.role === 'STAFF' ? 'Staff' : 'Billetterie'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="text-base font-semibold text-red-700 mb-2">Zone dangereuse</h2>
          <p className="text-sm text-gray-500 mb-4">Ces actions sont irréversibles.</p>
          <button
            disabled
            className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
          >
            Supprimer ce théâtre
          </button>
        </section>
      </div>
    </>
  )
}
