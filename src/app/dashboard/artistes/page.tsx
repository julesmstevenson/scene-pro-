import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Artist } from '@/types'

async function getArtists(): Promise<Artist[]> {
  try {
    return await prisma.artist.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default async function ArtistesPage() {
  const artists = await getArtists()

  return (
    <div className="px-10 py-10 max-w-5xl">

      {/* En-tête */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-gray-300 mb-2">
            Dashboard
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

      {/* Grille / État vide */}
      {artists.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {artists.map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  )
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/dashboard/artistes/${artist.id}/modifier`}
      className="group flex flex-col items-center gap-4 p-5 rounded-xl hover:bg-gray-50 transition-colors"
    >
      {/* Photo */}
      {artist.photoUrl ? (
        <img
          src={artist.photoUrl}
          alt={artist.name}
          className="w-20 h-20 rounded-full object-cover shrink-0 ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all"
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 text-lg font-bold transition-colors"
          style={{ backgroundColor: '#f4f3f0', color: '#c0b8ae' }}
        >
          {initials(artist.name)}
        </div>
      )}

      {/* Infos */}
      <div className="text-center min-w-0 w-full">
        <p className="font-serif font-semibold text-gray-900 leading-snug text-[15px] truncate">
          {artist.name}
        </p>
        {artist.email && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{artist.email}</p>
        )}
        {!artist.email && artist.bio && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{artist.bio}</p>
        )}
      </div>
    </Link>
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
