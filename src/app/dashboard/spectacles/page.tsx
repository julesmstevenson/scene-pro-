import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { EventWithDetails } from '@/types'

async function getEvents(): Promise<EventWithDetails[]> {
  try {
    return await prisma.event.findMany({
      include: { sessions: true, priceCategories: true },
      orderBy: { updatedAt: 'desc' },
    })
  } catch {
    return []
  }
}

function formatDate(date: string) {
  return new Date(date + 'T00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function priceRange(cats: { price: number }[]) {
  if (!cats.length) return null
  const prices = cats.map(c => c.price / 100)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? `${min} €` : `${min} – ${max} €`
}

export default async function SpectaclesPage() {
  const events = await getEvents()

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Spectacles</h1>
          <p className="text-sm text-gray-400 mt-1">
            {events.length > 0
              ? `${events.length} spectacle${events.length > 1 ? 's' : ''}`
              : 'Gérez vos représentations et événements'}
          </p>
        </div>
        <Link
          href="/dashboard/spectacles/nouveau"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)',
            boxShadow: '0 4px 14px rgba(139,26,26,0.3)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau spectacle
        </Link>
      </div>

      {/* Liste */}
      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event }: { event: EventWithDetails }) {
  const isPublished = event.status === 'PUBLISHED'
  const firstSession = event.sessions.sort((a, b) => a.date.localeCompare(b.date))[0]
  const range = priceRange(event.priceCategories)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-5 hover:shadow-md transition-shadow">
      {/* Affiche */}
      <div
        className="w-20 h-24 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'rgba(15,15,26,0.06)' }}
      >
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-gray-300">
            <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif font-semibold text-gray-900 text-base leading-snug truncate">
            {event.title || <span className="text-gray-400 italic">Sans titre</span>}
          </h2>
          <span
            className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={
              isPublished
                ? { backgroundColor: 'rgba(21,128,61,0.1)', color: '#15803d' }
                : { backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' }
            }
          >
            {isPublished ? 'Publié' : 'Brouillon'}
          </span>
        </div>

        {/* Auteur · Metteur en scène · Durée · Genre */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
          {event.author   && <span className="text-xs text-gray-500">✍ {event.author}</span>}
          {event.director && <span className="text-xs text-gray-500">🎬 {event.director}</span>}
          {event.duration && <span className="text-xs text-gray-400">⏱ {event.duration}</span>}
          {event.genre    && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#a8893a' }}>
              {event.genre}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          {firstSession ? (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {event.sessions.length} séance{event.sessions.length > 1 ? 's' : ''} · à partir du {formatDate(firstSession.date)}
            </span>
          ) : (
            <span className="text-gray-300">Aucune séance</span>
          )}
          {range && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              {range}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center shrink-0">
        <Link
          href={`/dashboard/spectacles/${event.id}/modifier`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
        >
          Modifier
        </Link>
      </div>
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
          <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      </div>
      <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2">Aucun spectacle pour l'instant</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        Créez votre premier spectacle pour commencer à vendre des billets.
      </p>
      <Link
        href="/dashboard/spectacles/nouveau"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Créer mon premier spectacle
      </Link>
    </div>
  )
}
