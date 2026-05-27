export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getArtistsWithEvents() {
  try {
    return await prisma.artist.findMany({
      orderBy: { name: 'asc' },
      include: {
        castRoles:     { include: { event: { select: { id: true, title: true } } } },
        creativeRoles: { include: { event: { select: { id: true, title: true } } } },
      },
    })
  } catch {
    return []
  }
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

export default async function ArtistesPage() {
  const artists = await getArtistsWithEvents()

  // Dédupliquer les pièces associées par artiste
  const artistsWithPieces = artists.map(a => {
    const seen = new Set<string>()
    const pieces = [
      ...a.castRoles.map(r => r.event),
      ...a.creativeRoles.map(r => r.event),
    ].filter(ev => {
      if (seen.has(ev.id)) return false
      seen.add(ev.id)
      return true
    })
    return { ...a, pieces }
  })

  return (
    <div className="px-10 py-10">

      {/* En-tête */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-gray-400 mb-2">
            Programmation
          </p>
          <h1 className="font-serif text-4xl font-bold text-gray-900 leading-none">
            Artistes
          </h1>
          {artists.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {artists.length} artiste{artists.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/artistes/nouveau"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#8B1A1A' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvel artiste
        </Link>
      </div>

      {artists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #f0eeeb' }}>
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">
                  Nom
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">
                  Catégorie
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">
                  E-mail
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">
                  Téléphone
                </th>
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">
                  Pièces associées
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {artistsWithPieces.map((artist, i) => (
                <tr
                  key={artist.id}
                  className="group hover:bg-gray-50/60 transition-colors"
                  style={{ borderTop: i === 0 ? undefined : '1px solid #f5f4f1' }}
                >
                  {/* Nom */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {artist.photoUrl ? (
                        <img
                          src={artist.photoUrl}
                          alt={artist.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                          style={{ backgroundColor: '#f4f3f0', color: '#b0a898' }}
                        >
                          {initials(artist.name)}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{artist.name}</span>
                    </div>
                  </td>

                  {/* Catégorie */}
                  <td className="px-5 py-4">
                    {artist.category ? (
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(139,26,26,0.07)', color: '#8B1A1A' }}
                      >
                        {artist.category}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* E-mail */}
                  <td className="px-5 py-4">
                    {artist.email ? (
                      <a
                        href={`mailto:${artist.email}`}
                        className="text-gray-600 hover:text-gray-900 transition-colors truncate max-w-[180px] block"
                      >
                        {artist.email}
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Téléphone */}
                  <td className="px-5 py-4">
                    {artist.phone ? (
                      <a
                        href={`tel:${artist.phone}`}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {artist.phone}
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Pièces associées */}
                  <td className="px-5 py-4">
                    {artist.pieces.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {artist.pieces.slice(0, 2).map(ev => (
                          <Link
                            key={ev.id}
                            href={`/dashboard/spectacles/${ev.id}/modifier`}
                            className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors truncate max-w-[140px]"
                          >
                            {ev.title || 'Sans titre'}
                          </Link>
                        ))}
                        {artist.pieces.length > 2 && (
                          <span className="text-xs text-gray-400 py-0.5">
                            +{artist.pieces.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/artistes/${artist.id}/modifier`}
                      className="text-xs font-medium text-gray-300 group-hover:text-gray-600 transition-colors"
                    >
                      Modifier →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(139,26,26,0.06)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" style={{ color: '#8B1A1A' }}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">
        Aucun artiste pour l'instant
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-8 leading-relaxed">
        Ajoutez les comédiens et membres de l'équipe créative de vos spectacles.
      </p>
      <Link
        href="/dashboard/artistes/nouveau"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#8B1A1A' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajouter mon premier artiste
      </Link>
    </div>
  )
}
