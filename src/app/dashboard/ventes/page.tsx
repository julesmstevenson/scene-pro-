'use client'

import { useEffect, useState, useCallback } from 'react'

const euro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

interface MonthCA { month: string; ca: number }
interface EventStat {
  id: string
  title: string
  status: string
  featured: boolean
  imageUrl: string | null
  bookingsCount: number
  ca: number
  ticketsSold: number
  avgBasket: number
}
interface VentesStats {
  totalCA: number
  totalBookings: number
  avgBasket: number
  recurringCustomers: number
  totalCustomers: number
  caByMonth: MonthCA[]
  eventStats: EventStat[]
}
interface EventOption {
  id: string
  title: string
  sessions: { id: string; date: string; time: string }[]
  priceCategories: { id: string; name: string; price: number }[]
}

// ─── Toggle switch ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40"
      style={{ backgroundColor: checked ? '#8B1A1A' : '#e5e7eb' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

// ─── Booking modal ──────────────────────────────────────────────────────────

function BookingModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(json => setEvents(json.data ?? []))
  }, [])

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const total = selectedEvent
    ? selectedEvent.priceCategories.reduce(
        (sum, pc) => sum + (quantities[pc.id] ?? 0) * pc.price,
        0,
      )
    : 0
  const totalTickets = Object.values(quantities).reduce((sum, q) => sum + q, 0)

  function adjustQty(pcId: string, delta: number) {
    setQuantities(q => ({ ...q, [pcId]: Math.max(0, (q[pcId] ?? 0) + delta) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEventId || !email || totalTickets === 0) {
      setError('Sélectionnez un spectacle, au moins 1 billet et saisissez un email.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const lines = selectedEvent!.priceCategories
        .filter(pc => (quantities[pc.id] ?? 0) > 0)
        .map(pc => ({
          priceCategoryId: pc.id,
          quantity: quantities[pc.id],
          unitPrice: pc.price,
        }))

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          customerFirstName: firstName || undefined,
          customerLastName: lastName || undefined,
          eventId: selectedEventId,
          sessionId: selectedSessionId || undefined,
          lines,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Erreur lors de la création')
        return
      }
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">Saisir une vente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Spectacle */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Spectacle *
            </label>
            <select
              value={selectedEventId}
              onChange={e => {
                setSelectedEventId(e.target.value)
                setSelectedSessionId('')
                setQuantities({})
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 bg-white"
              required
            >
              <option value="">— Choisir un spectacle —</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title || 'Sans titre'}
                </option>
              ))}
            </select>
          </div>

          {/* Séance */}
          {selectedEvent && selectedEvent.sessions.length > 0 && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Séance
              </label>
              <select
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 bg-white"
              >
                <option value="">— Non précisée —</option>
                {selectedEvent.sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.date} à {s.time}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Billets */}
          {selectedEvent && selectedEvent.priceCategories.length > 0 && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Billets
              </label>
              <div className="space-y-1">
                {selectedEvent.priceCategories.map(pc => (
                  <div
                    key={pc.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{pc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(pc.price / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => adjustQty(pc.id, -1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-base font-medium leading-none"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-gray-800">
                        {quantities[pc.id] ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQty(pc.id, 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-base font-medium leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalTickets > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {totalTickets} billet{totalTickets > 1 ? 's' : ''}
                  </p>
                  <p className="font-serif text-lg font-bold text-gray-900">
                    {euro.format(total / 100)}
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedEvent && selectedEvent.priceCategories.length === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5">
              Ce spectacle n&apos;a pas de tarifs configurés.
            </p>
          )}

          <div className="border-t border-gray-100" />

          {/* Client */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Client
            </label>
            <div className="space-y-2.5">
              <input
                type="email"
                placeholder="Email *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 placeholder-gray-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 placeholder-gray-300"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 placeholder-gray-300"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#8B1A1A' }}
            >
              {submitting
                ? 'Enregistrement…'
                : totalTickets > 0
                  ? `Confirmer · ${euro.format(total / 100)}`
                  : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function VentesPage() {
  const [stats, setStats] = useState<VentesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showOpeSpeciale, setShowOpeSpeciale] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ventes/stats')
      const json = await res.json()
      if (json.data) setStats(json.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  async function toggleFeatured(eventId: string, current: boolean) {
    setTogglingId(eventId)
    try {
      await fetch(`/api/events/${eventId}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !current }),
      })
      setStats(prev =>
        prev
          ? {
              ...prev,
              eventStats: prev.eventStats.map(e =>
                e.id === eventId ? { ...e, featured: !current } : e,
              ),
            }
          : null,
      )
    } finally {
      setTogglingId(null)
    }
  }

  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: euro.format((stats?.totalCA ?? 0) / 100),
      color: 'text-gray-900',
    },
    {
      label: 'Panier moyen',
      value: euro.format((stats?.avgBasket ?? 0) / 100),
      color: 'text-gray-900',
    },
    {
      label: 'Clients récurrents',
      value: String(stats?.recurringCustomers ?? 0),
      color: 'text-gray-900',
      sub: `sur ${stats?.totalCustomers ?? 0} client${(stats?.totalCustomers ?? 0) > 1 ? 's' : ''}`,
    },
    {
      label: 'Réservations',
      value: String(stats?.totalBookings ?? 0),
      color: 'text-gray-900',
    },
  ]

  const caByMonth = stats?.caByMonth ?? []
  const maxCA = Math.max(...caByMonth.map(m => m.ca), 1)
  const hasCA = caByMonth.some(m => m.ca > 0)

  // Featured events first for visual separation
  const allEvents = stats?.eventStats ?? []
  const featuredEvents = allEvents.filter(e => e.featured)
  const otherEvents = allEvents.filter(e => !e.featured)
  const sortedEvents = [...featuredEvents, ...otherEvents]

  return (
    <div className="p-8 max-w-[1300px]">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-gray-300 mb-2">
            Dashboard
          </p>
          <h1 className="font-serif text-4xl font-bold text-gray-900 leading-none">
            Pilotage des ventes
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Chiffre d'affaires · Panier moyen · Clients récurrents · Mise en avant
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#8B1A1A' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Saisir une vente
        </button>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setShowOpeSpeciale(true)}
          className="group flex items-center gap-4 bg-white rounded-xl px-5 py-4 border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all text-left"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            style={{ backgroundColor: 'rgba(139,26,26,0.07)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: '#8B1A1A' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">Opération spéciale</p>
            <p className="text-xs text-gray-400 mt-0.5">Promo, offre groupée, code remise</p>
          </div>
        </button>

        <button
          onClick={() => setShowBoostModal(true)}
          className="group flex items-center gap-4 bg-white rounded-xl px-5 py-4 border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all text-left"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(139,26,26,0.07)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: '#8B1A1A' }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">Optimiser mes ventes</p>
            <p className="text-xs text-gray-400 mt-0.5">Relances, canaux, spectacles à mettre en avant</p>
          </div>
        </button>

        <a
          href="/dashboard/revendeurs"
          className="group flex items-center gap-4 bg-white rounded-xl px-5 py-4 border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all text-left"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(139,26,26,0.07)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: '#8B1A1A' }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">Gérer mes revendeurs</p>
            <p className="text-xs text-gray-400 mt-0.5">Partenaires, quotas, commissions</p>
          </div>
        </a>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {kpi.label}
            </p>
            <p className={`font-serif text-2xl font-bold ${kpi.color}`}>
              {loading ? '—' : kpi.value}
            </p>
            {kpi.sub && (
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Graphique CA mensuel */}
      <div className="bg-[#11111c] rounded-2xl p-6 mb-6 text-white overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Évolution</p>
            <p className="font-serif text-xl font-semibold mt-1">Chiffre d'affaires mensuel</p>
          </div>
          <p className="text-xs text-white/30">12 derniers mois</p>
        </div>

        <div className="flex items-end gap-1.5 h-36">
          {caByMonth.map((m, i) => {
            const heightPct = maxCA > 0 ? (m.ca / maxCA) * 100 : 0
            const isMax = hasCA && m.ca === maxCA
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end" style={{ height: 104 }}>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: m.ca > 0 ? `${Math.max(heightPct, 3)}%` : '1px',
                      backgroundColor: isMax
                        ? '#8B1A1A'
                        : m.ca > 0
                          ? 'rgba(139,26,26,0.45)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  />
                </div>
                <span className="text-[9px] text-white/25">{m.month}</span>
              </div>
            )
          })}
        </div>

        {!loading && !hasCA && (
          <p className="text-center text-white/20 text-xs mt-4 pb-2">
            Aucune vente enregistrée — les données apparaîtront ici au fil des réservations
          </p>
        )}
      </div>

      {/* Table des spectacles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-semibold text-gray-800">Spectacles</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Performances de ventes et mise en avant
            </p>
          </div>
          {featuredEvents.length > 0 && (
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(139,26,26,0.08)', color: '#8B1A1A' }}
            >
              {featuredEvents.length} en vedette
            </span>
          )}
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-300 text-sm">Chargement…</div>
        ) : sortedEvents.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-gray-400 text-sm">Aucun spectacle</p>
            <p className="text-gray-300 text-xs mt-1">
              Créez des spectacles pour les voir apparaître ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center gap-5 px-6 py-4 hover:bg-gray-50/60 transition-colors"
              >
                {/* Miniature */}
                <div
                  className="w-10 h-12 rounded shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: '#f4f3f0' }}
                >
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-gray-300">
                      <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  )}
                </div>

                {/* Titre + statut */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-[15px] font-semibold text-gray-900 truncate">
                      {event.title || (
                        <span className="italic text-gray-300 font-normal">Sans titre</span>
                      )}
                    </p>
                    {event.status === 'DRAFT' && (
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                        brouillon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {event.bookingsCount} réservation{event.bookingsCount > 1 ? 's' : ''}
                    {' · '}
                    {event.ticketsSold} billet{event.ticketsSold > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Stats financières */}
                <div className="flex items-center gap-8 text-right shrink-0">
                  <div>
                    <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-wide mb-0.5">CA</p>
                    <p className="font-serif text-sm font-bold text-gray-800">
                      {euro.format(event.ca / 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-wide mb-0.5">Panier moy.</p>
                    <p className="font-serif text-sm font-bold text-gray-800">
                      {euro.format(event.avgBasket / 100)}
                    </p>
                  </div>
                </div>

                {/* Toggle En vedette */}
                <div className="flex items-center gap-2.5 shrink-0 pl-4 border-l border-gray-100">
                  <span className="text-xs text-gray-400">En vedette</span>
                  <Toggle
                    checked={event.featured}
                    disabled={togglingId === event.id}
                    onChange={() => toggleFeatured(event.id, event.featured)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Légende */}
      <p className="text-xs text-gray-400 mt-4">
        Les spectacles marqués &quot;En vedette&quot; peuvent être mis en avant sur votre page publique.
      </p>

      {/* Modal saisir une vente */}
      {showModal && (
        <BookingModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            fetchStats()
          }}
        />
      )}

      {/* Modal opération spéciale */}
      {showOpeSpeciale && (
        <InfoModal
          title="Opération spéciale"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{ color: '#8B1A1A' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          onClose={() => setShowOpeSpeciale(false)}
        >
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Créez des offres limitées dans le temps pour stimuler les ventes sur un spectacle précis.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Code de réduction', desc: 'Offrez un tarif préférentiel avec un code promo à partager', icon: '🏷️' },
              { label: 'Offre groupée', desc: 'Tarif réduit à partir de X billets achetés ensemble', icon: '🎟️' },
              { label: 'Vente flash', desc: 'Prix spécial valable 48h sur les dernières places', icon: '⚡' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-5 text-center">Fonctionnalité à venir — contactez-nous pour en savoir plus.</p>
        </InfoModal>
      )}

      {/* Modal booster mes ventes */}
      {showBoostModal && (
        <InfoModal
          title="Optimiser mes ventes"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{ color: '#8B1A1A' }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
          onClose={() => setShowBoostModal(false)}
        >
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Activez les bons leviers pour remplir votre salle et fidéliser votre public.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Mettre en avant un spectacle', desc: 'Activez le toggle "En vedette" dans le tableau ci-dessous pour le faire apparaître en priorité sur votre page publique', icon: '⭐' },
              { label: 'Relancer les clients récurrents', desc: 'Identifiez vos fidèles dans l\'onglet Spectateurs et envoyez-leur une offre exclusive', icon: '🔁' },
              { label: 'Activer le réseau revendeurs', desc: 'Configurez vos partenaires de distribution dans Gérer mes revendeurs', icon: '🤝' },
              { label: 'Analyser le panier moyen', desc: 'Ajustez vos tarifs pour maximiser le revenu par réservation', icon: '📊' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </InfoModal>
      )}
    </div>
  )
}

// ─── Info modal générique ───────────────────────────────────────────────────

function InfoModal({
  title,
  icon,
  onClose,
  children,
}: {
  title: string
  icon: React.ReactNode
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(139,26,26,0.08)' }}
          >
            {icon}
          </div>
          <h2 className="font-serif text-xl font-bold text-gray-900 flex-1">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
