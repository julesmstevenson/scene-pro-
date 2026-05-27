export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArtistForm } from '../../_components/ArtistForm'

interface Props {
  params: { id: string }
}

export default async function ModifierArtistePage({ params }: Props) {
  let artist
  try {
    artist = await prisma.artist.findUnique({ where: { id: params.id } })
  } catch {
    notFound()
  }

  if (!artist) notFound()

  // Spectacles où cet artiste est référencé
  const linkedEvents = await prisma.event.findMany({
    where: {
      OR: [
        { castMembers:  { some: { artistId: params.id } } },
        { creativeTeam: { some: { artistId: params.id } } },
      ],
    },
    select: {
      id:     true,
      title:  true,
      status: true,
      castMembers:  { where: { artistId: params.id }, select: { role: true } },
      creativeTeam: { where: { artistId: params.id }, select: { role: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="px-10 py-10 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-300 mb-8">
        <Link href="/dashboard/artistes" className="hover:text-gray-500 transition-colors">
          Artistes
        </Link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-gray-400 truncate max-w-xs">{artist.name}</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 leading-none">{artist.name}</h1>
        <p className="text-sm text-gray-400 mt-2">
          Modifié le{' '}
          {new Date(artist.updatedAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      <ArtistForm initialData={artist} />

      {/* Spectacles liés */}
      {linkedEvents.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Spectacles liés</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="space-y-2">
            {linkedEvents.map(ev => {
              const roles = [
                ...ev.castMembers.map(m => m.role),
                ...ev.creativeTeam.map(m => m.role),
              ].filter(Boolean).join(', ')
              return (
                <Link
                  key={ev.id}
                  href={`/dashboard/spectacles/${ev.id}/modifier`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: ev.status === 'PUBLISHED' ? '#15803d' : '#9ca3af' }}
                    />
                    <span className="text-sm font-medium text-gray-800 truncate group-hover:text-gray-900">
                      {ev.title || <span className="italic text-gray-400">Sans titre</span>}
                    </span>
                  </div>
                  {roles && (
                    <span className="text-xs text-gray-400 shrink-0">{roles}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
