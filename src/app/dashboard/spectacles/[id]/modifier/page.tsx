import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SpectacleForm } from '../../nouveau/_components/SpectacleForm'

async function getEvent(id: string) {
  try {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        sessions:        true,
        priceCategories: true,
        castMembers:     true,
        creativeTeam:    true,
      },
    })
  } catch {
    return null
  }
}

export default async function ModifierSpectaclePage({
  params,
}: {
  params: { id: string }
}) {
  const event = await getEvent(params.id)
  if (!event) notFound()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard/spectacles" className="hover:text-gray-600 transition-colors">
          Spectacles
        </Link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-gray-600 truncate max-w-xs">
          {event.title || 'Sans titre'}
        </span>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            {event.title || <span className="text-gray-400 italic">Sans titre</span>}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Modifié le{' '}
            {new Date(event.updatedAt).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <span
          className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full mt-1"
          style={
            event.status === 'PUBLISHED'
              ? { backgroundColor: 'rgba(21,128,61,0.1)', color: '#15803d' }
              : { backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' }
          }
        >
          {event.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
        </span>
      </div>

      <SpectacleForm initialData={event} />
    </div>
  )
}
