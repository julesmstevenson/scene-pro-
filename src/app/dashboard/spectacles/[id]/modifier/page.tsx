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
    <div className="px-10 py-10 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-300 mb-8">
        <Link href="/dashboard/spectacles" className="hover:text-gray-500 transition-colors">
          Spectacles
        </Link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-gray-400 truncate max-w-xs">
          {event.title || 'Sans titre'}
        </span>
      </div>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 leading-none">
            {event.title || <span className="text-gray-300 italic font-normal">Sans titre</span>}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Modifié le{' '}
            {new Date(event.updatedAt).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <span
          className="shrink-0 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
          style={
            event.status === 'PUBLISHED'
              ? { backgroundColor: 'rgba(139,26,26,0.08)', color: '#8B1A1A' }
              : { backgroundColor: '#f4f3f0', color: '#9ca3af' }
          }
        >
          {event.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
        </span>
      </div>

      <SpectacleForm initialData={event} />
    </div>
  )
}
