export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { EventWithDetails } from '@/types'

async function getEvents(): Promise<EventWithDetails[]> {
  try {
    return await prisma.event.findMany({
      include: { sessions: true, priceCategories: true, castMembers: true, creativeTeam: true },
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
    <div className="px-10 py-10 max-w-5xl">

      {/* En-tête */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-gray-300 mb-2">
            Dashboard
          </p>
          <h1 className="font-serif text-4xl font-bold text-gray-900 leading-none">
            Spectacles
          </h1>
          {events.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {events.length} spectacle{events.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/spectacles/nouveau"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#8B1A1A' }}
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
        <div className="divide-y divide-gray-100">
          {events.map(event => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventRow({ event }: { event: EventWithDetails }) {
  const isPublished = event.status === 'PUBLISHED'
  const firstSession = [...event.sessions].sort((a, b) => a.date.localeCompare(b.date))[0]
  const range = priceRange(event.priceCategories)

  return (
    <div className="group flex items-center gap-6 py-5 hover:bg-gray-50/60 -mx-4 px-4 rounded-xl transition-colors">

      {/* Affiche miniature */}
      <div
        className="w-14 h-[68px] rounded-md shrink-0 overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: '#f4f3f0' }}
      >
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-300">
            <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">

        {/* Titre + statut */}
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-[17px] font-semibold text-gray-900 leading-snug">
            {event.title || <span className="text-gray-300 italic font-normal">Sans titre</span>}
          </h2>
          <span
            className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full shrink-0"
            style={
              isPublished
                ? { backgroundColor: 'rgba(139,26,26,0.08)', color: '#8B1A1A' }
                : { backgroundColor: '#f4f3f0', color: '#9ca3af' }
            }
          >
            {isPublished ? 'Publié' : 'Brouillon'}
          </span>
        </div>

        {/* Méta */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
          {event.author && (
            <span className="text-xs text-gray-500">{event.author}</span>
          )}
          {event.author && event.genre && (
            <span className="text-gray-200 text-xs">·</span>
          )}
          {event.genre && (
            <span className="text-xs text-gray-400">{event.genre}</span>
          )}
          {event.duration && (
            <>
              <span className="text-gray-200 text-xs">·</span>
              <span className="text-xs text-gray-400">{event.duration}</span>
            </>
          )}
        </div>

        {/* Séances + tarifs */}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          {firstSession ? (
            <span>
              {event.sessions.length} séance{event.sessions.length > 1 ? 's' : ''}
              {' · '}à partir du {formatDate(firstSession.date)}
            </span>
          ) : (
            <span className="text-gray-300">Aucune séance</span>
          )}
          {range && (
            <>
              <span className="text-gray-200">·</span>
              <span>{range}</span>
            </>
          )}
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/dashboard/spectacles/${event.id}/modifier`}
        className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-gray-300 group-hover:text-gray-600 transition-colors"
      >
        Modifier
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
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
          <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      </div>
      <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">
        Aucun spectacle pour l'instant
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-8 leading-relaxed">
        Créez votre premier spectacle pour commencer à gérer vos représentations.
      </p>
      <Link
        href="/dashboard/spectacles/nouveau"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#8B1A1A' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Créer mon premier spectacle
      </Link>
    </div>
  )
}
