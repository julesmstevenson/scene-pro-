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
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Artistes</h1>
          <p className="text-sm text-gray-400 mt-1">
            {artists.length > 0
              ? `${artists.length} artiste${artists.length > 1 ? 's' : ''}`
              : 'Gérez les artistes de vos spectacles'}
          </p>
        </div>
        <Link
          href="/dashboard/artistes/nouveau"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)',
            boxShadow: '0 4px 14px rgba(139,26,26,0.3)',
          }}
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
        <div className="grid grid-cols-3 gap-4">
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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
      {/* Photo ou avatar initiales */}
      {artist.photoUrl ? (
        <img
          src={artist.photoUrl}
          alt={artist.name}
          className="w-14 h-14 rounded-full object-cover shrink-0"
          style={{ border: '2px solid rgba(201,168,76,0.25)' }}
        />
      ) : (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-base font-bold"
          style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#a8893a' }}
        >
          {initials(artist.name)}
        </div>
      )}

      {/* Nom */}
      <div className="text-center">
        <p className="font-serif font-semibold text-gray-900 leading-snug">{artist.name}</p>
        {artist.email && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{artist.email}</p>
        )}
      </div>

      {/* Bouton modifier */}
      <Link
        href={`/dashboard/artistes/${artist.id}/modifier`}
        className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
      >
        Modifier
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: 'rgba(139,26,26,0.08)', color: '#8B1A1A' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2">
        Aucun artiste pour l'instant
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        Ajoutez les comédiens et membres de l'équipe créative de vos spectacles.
      </p>
      <Link
        href="/dashboard/artistes/nouveau"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajouter mon premier artiste
      </Link>
    </div>
  )
}
