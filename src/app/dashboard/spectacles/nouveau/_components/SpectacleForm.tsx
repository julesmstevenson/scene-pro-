'use client'

import { useState, useEffect, useCallback, useRef, useId } from 'react'
import { useRouter } from 'next/navigation'
import {
  SpectacleCard, CardTemplate, CardData, TEMPLATES, CARD_W, CARD_H,
} from './SpectacleCard'
import type { EventWithDetails } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)

async function resizeImage(file: File, maxW = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img     = new Image()
    const blobUrl = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.width, h = img.height
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(blobUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = blobUrl
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionRow { id: string; date: string; time: string }
interface PriceRow   { id: string; name: string; price: string }
interface PersonRow  { id: string; role: string; name: string; artistId?: string }
type SaveStatus = 'idle' | 'saving' | 'saved'
type Tab = 'infos' | 'distribution' | 'seances' | 'apercu'

interface ArtistSuggestion {
  id:       string
  name:     string
  photoUrl: string | null
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT = [
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm',
  'focus:outline-none focus:ring-2 focus:ring-bordeaux/20 focus:border-transparent transition-shadow',
].join(' ')

const ICON_BTN = [
  'p-1.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors',
  'disabled:opacity-30 disabled:cursor-not-allowed',
].join(' ')

// ─── Genres suggérés ──────────────────────────────────────────────────────────

const GENRE_SUGGESTIONS = [
  'Comédie', 'Drame', 'Comédie dramatique', 'Théâtre contemporain',
  'Classique', 'Comédie musicale', 'One man show', 'One woman show',
  'Café-théâtre', 'Jeune public', 'Cirque', 'Performance',
]

// ─── Sous-composants ──────────────────────────────────────────────────────────

function ArtistAutocomplete({
  value,
  artistId,
  onChange,
  placeholder,
}: {
  value:       string
  artistId?:   string
  onChange:    (name: string, artistId?: string) => void
  placeholder?: string
}) {
  const [query,        setQuery]        = useState(value)
  const [suggestions,  setSuggestions]  = useState<ArtistSuggestion[]>([])
  const [open,         setOpen]         = useState(false)
  const debounceRef                      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef                     = useRef<HTMLDivElement>(null)
  const inputId                          = useId()

  // Sync external value changes
  useEffect(() => { setQuery(value) }, [value])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    onChange(val, undefined) // clear artistId when typing freely

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setSuggestions([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/artists?search=${encodeURIComponent(val)}`)
        if (!res.ok) return
        const json = await res.json()
        setSuggestions(json.data ?? [])
        setOpen(true)
      } catch {
        // silently ignore fetch errors in autocomplete
      }
    }, 250)
  }

  function handleSelect(artist: ArtistSuggestion) {
    setQuery(artist.name)
    onChange(artist.name, artist.id)
    setSuggestions([])
    setOpen(false)
  }

  function handleBlur() {
    // Small delay so a click on a suggestion registers first
    setTimeout(() => setOpen(false), 150)
  }

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          id={inputId}
          className={INPUT}
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          onBlur={handleBlur}
          autoComplete="off"
        />
        {/* Linked indicator */}
        {artistId && (
          <span
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            title="Artiste lié au répertoire"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" style={{ color: '#8B1A1A' }}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map(artist => (
            <li key={artist.id}>
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                onMouseDown={e => { e.preventDefault(); handleSelect(artist) }}
              >
                {artist.photoUrl ? (
                  <img
                    src={artist.photoUrl}
                    alt={artist.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ backgroundColor: '#f4f3f0', color: '#9ca3af' }}
                  >
                    {initials(artist.name)}
                  </div>
                )}
                <span className="truncate text-gray-800">{artist.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
      {optional && <span className="ml-1 text-gray-300 font-normal normal-case tracking-normal">— facultatif</span>}
    </label>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{children}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function DuplicateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-medium mt-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      style={{ color: '#8B1A1A' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {label}
    </button>
  )
}

// ─── Onglets ──────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'infos',         label: 'Informations'     },
  { id: 'distribution',  label: 'Distribution'     },
  { id: 'seances',       label: 'Séances & Tarifs' },
  { id: 'apercu',        label: 'Aperçu'           },
]

// ─── Composant principal ──────────────────────────────────────────────────────

export function SpectacleForm({ initialData }: { initialData?: EventWithDetails }) {
  const router  = useRouter()
  const isEdit  = !!initialData

  // — Infos générales
  const [title,       setTitle]    = useState(initialData?.title       ?? '')
  const [description, setDesc]     = useState(initialData?.description ?? '')
  const [author,      setAuthor]   = useState(initialData?.author      ?? '')
  const [director,    setDirector] = useState(initialData?.director    ?? '')
  const [duration,    setDuration] = useState(initialData?.duration    ?? '')
  const [genre,       setGenre]    = useState(initialData?.genre       ?? '')
  const [ageMin,      setAgeMin]   = useState('')
  const [website,     setWebsite]  = useState('')

  // — Visuel
  const [imgPreview, setImgPreview] = useState<string | null>(initialData?.imageUrl ?? null)
  const [imgData,    setImgData]    = useState<string | null>(initialData?.imageUrl ?? null)

  // — Distribution
  const [cast, setCast] = useState<PersonRow[]>(
    initialData?.castMembers.length
      ? initialData.castMembers.map(c => ({
          id: uid(), role: c.role, name: c.name,
          artistId: c.artistId ?? undefined,
        }))
      : [{ id: uid(), role: '', name: '' }],
  )

  // — Équipe créative
  const [creativeTeam, setCreativeTeam] = useState<PersonRow[]>(
    initialData?.creativeTeam.length
      ? initialData.creativeTeam.map(c => ({
          id: uid(), role: c.role, name: c.name,
          artistId: c.artistId ?? undefined,
        }))
      : [
          { id: uid(), role: 'Mise en scène', name: '' },
          { id: uid(), role: 'Scénographie',  name: '' },
          { id: uid(), role: 'Costumes',      name: '' },
          { id: uid(), role: 'Lumières',      name: '' },
          { id: uid(), role: 'Son',           name: '' },
        ],
  )

  // — Séances
  const [sessions, setSessions] = useState<SessionRow[]>(
    initialData?.sessions.length
      ? [...initialData.sessions]
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
          .map(s => ({ id: uid(), date: s.date, time: s.time }))
      : [{ id: uid(), date: '', time: '' }],
  )

  // — Import IA séances
  const [parseText,   setParseText]   = useState('')
  const [isParsing,   setIsParsing]   = useState(false)
  const [parsedDraft, setParsedDraft] = useState<{ date: string; time: string }[] | null>(null)
  const [parseError,  setParseError]  = useState<string | null>(null)

  // — Tarifs
  const [prices, setPrices] = useState<PriceRow[]>(
    initialData?.priceCategories.length
      ? initialData.priceCategories.map(p => ({
          id: uid(), name: p.name, price: String(p.price / 100),
        }))
      : [
          { id: uid(), name: 'Plein tarif', price: '25' },
          { id: uid(), name: 'Réduit',      price: '18' },
        ],
  )

  // — Modèle de carte
  const [cardTemplate, setCardTemplate] = useState<CardTemplate>(
    (initialData?.cardTemplate as CardTemplate) ?? 'classique',
  )

  // — Statut
  const [currentStatus, setCurrentStatus] = useState<'DRAFT' | 'PUBLISHED'>(
    initialData?.status ?? 'DRAFT',
  )

  // — Navigation
  const [tab, setTab] = useState<Tab>('infos')

  // — Sauvegarde
  const [saveStatus,   setSaveStatus]  = useState<SaveStatus>('idle')
  const [lastSaved,    setLastSaved]   = useState<string | null>(null)
  const [isPublishing, setPublishing]  = useState(false)
  const [error,        setError]       = useState<string | null>(null)

  const eventIdRef = useRef<string | null>(initialData?.id ?? null)
  const formRef    = useRef({
    title, description, author, director, duration, genre, ageMin, website,
    imgData, cast, creativeTeam, sessions, prices, cardTemplate,
  })
  useEffect(() => {
    formRef.current = {
      title, description, author, director, duration, genre, ageMin, website,
      imgData, cast, creativeTeam, sessions, prices, cardTemplate,
    }
  }, [title, description, author, director, duration, genre, ageMin, website,
      imgData, cast, creativeTeam, sessions, prices, cardTemplate])

  // ── Payload ──────────────────────────────────────────────────────────────────

  function buildPayload(f: typeof formRef.current, status: 'DRAFT' | 'PUBLISHED') {
    return {
      title:        f.title.trim(),
      description:  f.description.trim() || null,
      imageUrl:     f.imgData,
      author:       f.author.trim()   || null,
      director:     f.director.trim() || null,
      duration:     f.duration.trim() || null,
      genre:        f.genre.trim()    || null,
      cardTemplate: f.cardTemplate,
      status,
      sessions: f.sessions
        .filter(s => s.date && s.time)
        .map(({ date, time }) => ({ date, time })),
      priceCategories: f.prices
        .filter(p => p.name.trim() && p.price)
        .map(({ name, price }) => ({
          name:  name.trim(),
          price: Math.round(parseFloat(price) * 100),
        })),
      castMembers: f.cast
        .filter(c => c.name.trim())
        .map(({ role, name, artistId }) => ({ role: role.trim(), name: name.trim(), artistId: artistId ?? null })),
      creativeTeam: f.creativeTeam
        .filter(c => c.name.trim())
        .map(({ role, name, artistId }) => ({ role: role.trim(), name: name.trim(), artistId: artistId ?? null })),
    }
  }

  // ── Sauvegarde ───────────────────────────────────────────────────────────────

  const doSave = useCallback(async (
    formData: typeof formRef.current,
    status: 'DRAFT' | 'PUBLISHED',
  ): Promise<string | null> => {
    if (!formData.title.trim()) return null
    setSaveStatus('saving')
    try {
      const id  = eventIdRef.current
      const res = id
        ? await fetch(`/api/events/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPayload(formData, status)),
          })
        : await fetch('/api/events', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPayload(formData, status)),
          })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      if (!eventIdRef.current) eventIdRef.current = json.data.id
      setCurrentStatus(status)
      setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
      setSaveStatus('saved')
      return json.data.id
    } catch (e) {
      console.error(e)
      setSaveStatus('idle')
      return null
    }
  }, [])

  // Auto-save toutes les 30 s
  useEffect(() => {
    const t = setInterval(() => doSave(formRef.current, 'DRAFT'), 30_000)
    return () => clearInterval(t)
  }, [doSave])

  // ── Image ────────────────────────────────────────────────────────────────────

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setError('Image trop lourde (max 5 Mo)'); return }
    setError(null)
    setImgPreview(URL.createObjectURL(file))
    try { setImgData(await resizeImage(file)) }
    catch { setError("Impossible de lire l'image") }
  }

  // ── Import IA séances ────────────────────────────────────────────────────────

  async function handleParse() {
    if (!parseText.trim()) return
    setIsParsing(true)
    setParseError(null)
    setParsedDraft(null)
    try {
      const res = await fetch('/api/sessions/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: parseText }),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      if (!data.sessions?.length) setParseError('Aucune séance détectée — reformule ou vérifie le texte.')
      else setParsedDraft(data.sessions)
    } catch {
      setParseError("Impossible d'analyser le texte. Vérifie ta connexion ou réessaie.")
    } finally {
      setIsParsing(false)
    }
  }

  function applyParsed() {
    if (!parsedDraft) return
    const news = parsedDraft.map(s => ({ id: uid(), date: s.date, time: s.time }))
    setSessions(prev => {
      const filled = prev.filter(s => s.date && s.time)
      return [...filled, ...news]
    })
    setParsedDraft(null)
    setParseText('')
  }

  function fmtParsed(date: string) {
    return new Date(date + 'T00:00').toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short',
    })
  }

  // ── Publication ──────────────────────────────────────────────────────────────

  async function handlePublish() {
    if (!title.trim()) { setError('Le titre est obligatoire'); return }
    setError(null)
    setPublishing(true)
    const id = await doSave(formRef.current, 'PUBLISHED')
    setPublishing(false)
    if (id) router.push('/dashboard/spectacles')
    else setError('Erreur lors de la publication.')
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-0 pb-12">

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-5 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="px-6 py-3.5 text-sm font-medium transition-colors relative"
              style={{
                color:           tab === t.id ? '#0f0f1a' : '#9ca3af',
                backgroundColor: tab === t.id ? 'transparent' : 'transparent',
              }}
            >
              {t.label}
              {tab === t.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#8B1A1A' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Contenu de l'onglet ─────────────────────────────────────────── */}
        <div className="p-6 space-y-6">

          {/* ① INFORMATIONS ─────────────────────────────────────────────────── */}
          {tab === 'infos' && (
            <>
              {/* Titre + description */}
              <div className="space-y-4">
                <SectionTitle>Présentation</SectionTitle>
                <div>
                  <FieldLabel>Titre du spectacle <span style={{ color: '#8B1A1A' }}>*</span></FieldLabel>
                  <input className={INPUT} placeholder="ex : Roméo et Juliette"
                    value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <FieldLabel optional>Synopsis / description</FieldLabel>
                  <textarea className={`${INPUT} resize-none`} rows={4}
                    placeholder="Synopsis, propos du spectacle, note d'intention…"
                    value={description} onChange={e => setDesc(e.target.value)} />
                </div>
              </div>

              {/* Fiche artistique */}
              <div className="space-y-4">
                <SectionTitle>Fiche artistique</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel optional>Auteur / Autrice</FieldLabel>
                    <input className={INPUT} placeholder="ex : Molière"
                      value={author} onChange={e => setAuthor(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel optional>Mise en scène</FieldLabel>
                    <input className={INPUT} placeholder="ex : Marie Dupont"
                      value={director} onChange={e => setDirector(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel optional>Durée</FieldLabel>
                    <input className={INPUT} placeholder="ex : 1h15, 2h avec entracte"
                      value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel optional>Genre</FieldLabel>
                    <input className={INPUT} placeholder="ex : Comédie, Drame…"
                      list="genre-suggestions" value={genre}
                      onChange={e => setGenre(e.target.value)} />
                    <datalist id="genre-suggestions">
                      {GENRE_SUGGESTIONS.map(g => <option key={g} value={g} />)}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel optional>Âge conseillé</FieldLabel>
                    <input className={INPUT} placeholder="ex : Dès 8 ans, Tout public"
                      value={ageMin} onChange={e => setAgeMin(e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel optional>Site web</FieldLabel>
                    <input className={INPUT} placeholder="ex : https://monspectacle.fr"
                      value={website} onChange={e => setWebsite(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Affiche */}
              <div>
                <SectionTitle>Affiche</SectionTitle>
                <p className="text-xs text-gray-400 mb-3">JPG, PNG, WebP · Max 5 Mo</p>
                {imgPreview ? (
                  <div className="relative inline-block">
                    <img src={imgPreview} alt="Aperçu affiche"
                      className="h-64 w-auto rounded-lg object-cover shadow-md" />
                    <button type="button"
                      onClick={() => { setImgPreview(null); setImgData(null) }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3.5 h-3.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center gap-3 h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-colors group"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: 'rgba(139,26,26,0.07)', color: '#8B1A1A' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Déposer une image ou <span style={{ color: '#8B1A1A' }}>parcourir</span>
                    </p>
                    <input type="file" accept="image/*" className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  </label>
                )}
              </div>
            </>
          )}

          {/* ② DISTRIBUTION ──────────────────────────────────────────────────── */}
          {tab === 'distribution' && (
            <>
              {/* Comédiens */}
              <div>
                <SectionTitle>Comédien·nes</SectionTitle>
                <div className="space-y-2.5">
                  {cast.length > 0 && (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Personnage / Rôle</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Comédien·ne</span>
                      <span />
                    </div>
                  )}
                  {cast.map(c => (
                    <div key={c.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                      <input className={INPUT} placeholder="ex : Hamlet"
                        value={c.role}
                        onChange={e => setCast(prev => prev.map(r => r.id === c.id ? { ...r, role: e.target.value } : r))} />
                      <ArtistAutocomplete
                        value={c.name}
                        artistId={c.artistId}
                        placeholder="ex : Jean Martin"
                        onChange={(name, artistId) =>
                          setCast(prev => prev.map(r => r.id === c.id ? { ...r, name, artistId } : r))
                        }
                      />
                      <button type="button" className={ICON_BTN}
                        disabled={cast.length === 1}
                        onClick={() => setCast(prev => prev.filter(r => r.id !== c.id))}>
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <AddButton onClick={() => setCast(prev => [...prev, { id: uid(), role: '', name: '' }])}
                    label="Ajouter un comédien" />
                </div>
              </div>

              {/* Équipe créative */}
              <div>
                <SectionTitle>Équipe créative</SectionTitle>
                <p className="text-xs text-gray-400 mb-3">Metteur en scène, scénographe, costumier, éclairagiste…</p>
                <div className="space-y-2.5">
                  {creativeTeam.length > 0 && (
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Fonction</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Nom</span>
                      <span />
                    </div>
                  )}
                  {creativeTeam.map(c => (
                    <div key={c.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                      <input className={INPUT} placeholder="ex : Costumes"
                        value={c.role}
                        onChange={e => setCreativeTeam(prev => prev.map(r => r.id === c.id ? { ...r, role: e.target.value } : r))} />
                      <ArtistAutocomplete
                        value={c.name}
                        artistId={c.artistId}
                        placeholder="ex : Sophie Bernard"
                        onChange={(name, artistId) =>
                          setCreativeTeam(prev => prev.map(r => r.id === c.id ? { ...r, name, artistId } : r))
                        }
                      />
                      <button type="button" className={ICON_BTN}
                        onClick={() => setCreativeTeam(prev => prev.filter(r => r.id !== c.id))}>
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <AddButton onClick={() => setCreativeTeam(prev => [...prev, { id: uid(), role: '', name: '' }])}
                    label="Ajouter un membre" />
                </div>
              </div>
            </>
          )}

          {/* ③ SÉANCES & TARIFS ──────────────────────────────────────────────── */}
          {tab === 'seances' && (
            <>
              {/* Import IA */}
              <div>
                <SectionTitle>Import intelligent</SectionTitle>
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 space-y-3">
                  <p className="text-xs text-gray-400">
                    Colle le planning depuis ton dossier de presse, ou décris-le en langage naturel.
                  </p>
                  <textarea
                    className={`${INPUT} resize-none bg-white`}
                    rows={3}
                    placeholder={'ex : "tous les lundis à 19h et vendredis à 20h30 du 3 mars au 30 mai"\nou : "Mardi 4 mars 20h30, Mercredi 5 mars 15h, Samedi 8 mars 20h30"'}
                    value={parseText}
                    onChange={e => { setParseText(e.target.value); setParsedDraft(null); setParseError(null) }}
                  />

                  {/* Bouton Analyser */}
                  {!parsedDraft && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={!parseText.trim() || isParsing}
                        onClick={handleParse}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}
                      >
                        {isParsing ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Analyse en cours…
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                              <path d="M12 2a10 10 0 1 0 10 10" /><path d="M22 2 12 12" /><path d="m17 2 5 5-5 5" />
                            </svg>
                            Analyser avec l'IA
                          </>
                        )}
                      </button>
                      {parseError && <p className="text-xs text-red-500">{parseError}</p>}
                    </div>
                  )}

                  {/* Résultat de l'analyse */}
                  {parsedDraft && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(21,128,61,0.12)', color: '#15803d' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="text-xs font-semibold" style={{ color: '#15803d' }}>
                          {parsedDraft.length} séance{parsedDraft.length > 1 ? 's' : ''} détectée{parsedDraft.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Liste preview — max 8 affichées */}
                      <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto">
                        {parsedDraft.slice(0, 20).map((s, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-100 text-xs text-gray-600">
                            <span className="font-medium">{fmtParsed(s.date)}</span>
                            <span className="text-gray-300">·</span>
                            <span>{s.time}</span>
                          </div>
                        ))}
                        {parsedDraft.length > 20 && (
                          <div className="col-span-2 text-xs text-gray-400 px-1">
                            + {parsedDraft.length - 20} séances supplémentaires
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button type="button" onClick={applyParsed}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                          style={{ backgroundColor: '#15803d' }}>
                          Ajouter ces {parsedDraft.length} séances
                        </button>
                        <button type="button" onClick={() => { setParsedDraft(null); setParseText('') }}
                          className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Séances */}
              <div>
                <SectionTitle>Séances</SectionTitle>
                <div className="space-y-2.5">
                  {sessions.length > 0 && (
                    <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Date</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Heure</span>
                      <span /><span />
                    </div>
                  )}
                  {sessions.map(s => (
                    <div key={s.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
                      <input type="date" className={INPUT} value={s.date}
                        onChange={e => setSessions(prev => prev.map(r => r.id === s.id ? { ...r, date: e.target.value } : r))} />
                      <input type="time" className={INPUT} value={s.time}
                        onChange={e => setSessions(prev => prev.map(r => r.id === s.id ? { ...r, time: e.target.value } : r))} />
                      <button type="button" title="Dupliquer" className={ICON_BTN}
                        onClick={() => {
                          const idx = sessions.findIndex(r => r.id === s.id)
                          setSessions(prev => [
                            ...prev.slice(0, idx + 1),
                            { ...s, id: uid() },
                            ...prev.slice(idx + 1),
                          ])
                        }}>
                        <DuplicateIcon />
                      </button>
                      <button type="button" title="Supprimer" className={ICON_BTN}
                        disabled={sessions.length === 1}
                        onClick={() => setSessions(prev => prev.filter(r => r.id !== s.id))}>
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <AddButton onClick={() => setSessions(prev => [...prev, { id: uid(), date: '', time: '' }])}
                    label="Ajouter une séance" />
                </div>
              </div>

              {/* Tarifs */}
              <div>
                <SectionTitle>Tarifs</SectionTitle>
                <div className="space-y-2.5">
                  {prices.length > 0 && (
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Nom du tarif</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 text-right px-1">Prix (€)</span>
                      <span />
                    </div>
                  )}
                  {prices.map(p => (
                    <div key={p.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                      <input className={INPUT} placeholder="ex : Plein tarif"
                        value={p.name}
                        onChange={e => setPrices(prev => prev.map(r => r.id === p.id ? { ...r, name: e.target.value } : r))} />
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="0" step="0.5" className={`${INPUT} w-28 text-right`}
                          placeholder="0,00" value={p.price}
                          onChange={e => setPrices(prev => prev.map(r => r.id === p.id ? { ...r, price: e.target.value } : r))} />
                        <span className="text-sm font-medium text-gray-400">€</span>
                      </div>
                      <button type="button" className={ICON_BTN}
                        onClick={() => setPrices(prev => prev.filter(r => r.id !== p.id))}>
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <AddButton onClick={() => setPrices(prev => [...prev, { id: uid(), name: '', price: '' }])}
                    label="Ajouter un tarif" />
                </div>
              </div>
            </>
          )}

          {/* ④ APERÇU ────────────────────────────────────────────────────────── */}
          {tab === 'apercu' && (() => {
            const validSessions = sessions.filter(s => s.date && s.time)
            const firstSession  = validSessions.sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
            const validPrices   = prices.filter(p => p.price && !isNaN(parseFloat(p.price)))
            const priceFrom     = validPrices.length
              ? Math.min(...validPrices.map(p => Math.round(parseFloat(p.price) * 100)))
              : null

            const previewData: CardData = {
              title:        title || 'Titre du spectacle',
              author:       author   || null,
              director:     director || null,
              duration:     duration || null,
              genre:        genre    || null,
              imageUrl:     imgData  || null,
              firstSession: firstSession ? { date: firstSession.date, time: firstSession.time } : null,
              priceFrom,
            }

            return (
              <div className="space-y-6">
                {/* Sélecteur */}
                <div>
                  <SectionTitle>Modèle de carte</SectionTitle>
                  <div className="flex flex-wrap gap-4">
                    {TEMPLATES.map(tpl => {
                      const selected = cardTemplate === tpl.id
                      return (
                        <button key={tpl.id} type="button"
                          onClick={() => setCardTemplate(tpl.id as CardTemplate)}
                          className="flex flex-col items-center gap-2">
                          <div style={{
                            width: CARD_W * 0.5, height: CARD_H * 0.5,
                            overflow: 'hidden', borderRadius: 10,
                            boxShadow: selected
                              ? '0 0 0 2px #8B1A1A, 0 4px 16px rgba(139,26,26,0.15)'
                              : '0 0 0 1.5px #e5e7eb',
                            transition: 'box-shadow 0.15s',
                          }}>
                            <div style={{
                              transform: 'scale(0.5)', transformOrigin: 'top left',
                              width: CARD_W, height: CARD_H, pointerEvents: 'none',
                            }}>
                              <SpectacleCard data={previewData} template={tpl.id as CardTemplate} />
                            </div>
                          </div>
                          <span className="text-xs font-semibold"
                            style={{ color: selected ? '#8B1A1A' : '#9ca3af' }}>
                            {tpl.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Aperçu pleine taille */}
                <div>
                  <SectionTitle>Aperçu</SectionTitle>
                  <div className="flex items-start">
                    <SpectacleCard data={previewData} template={cardTemplate} />
                  </div>
                </div>
              </div>
            )
          })()}

        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-3">
          {error}
        </div>
      )}

      {/* Actions ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1">
        {/* Gauche : statut + indicateur sauvegarde */}
        <div className="flex items-center gap-3">
          {/* Badge statut (mode édition) */}
          {isEdit && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={currentStatus === 'PUBLISHED'
                ? { backgroundColor: 'rgba(21,128,61,0.1)', color: '#15803d' }
                : { backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' }}
            >
              {currentStatus === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
            </span>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400 min-h-[20px]">
            {saveStatus === 'saving' && (
              <><span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />Sauvegarde…</>
            )}
            {saveStatus === 'saved' && lastSaved && (
              <><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />Sauvegardé à {lastSaved}</>
            )}
          </div>
        </div>

        {/* Droite : boutons */}
        <div className="flex items-center gap-3">
          {/* Dépublier — mode édition uniquement, spectacle publié */}
          {isEdit && currentStatus === 'PUBLISHED' && (
            <button type="button" disabled={!title.trim()}
              onClick={() => doSave(formRef.current, 'DRAFT')}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Dépublier
            </button>
          )}
          {/* Enregistrer brouillon — création ou spectacle non publié */}
          {(!isEdit || currentStatus !== 'PUBLISHED') && (
            <button type="button" disabled={!title.trim()}
              onClick={() => doSave(formRef.current, 'DRAFT')}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Enregistrer le brouillon
            </button>
          )}
          {/* Enregistrer les modifications — mode édition publié */}
          {isEdit && currentStatus === 'PUBLISHED' && (
            <button type="button" disabled={isPublishing || !title.trim()} onClick={handlePublish}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#8B1A1A',
                              }}>
              {isPublishing
                ? <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Enregistrement…
                  </span>
                : 'Enregistrer les modifications'}
            </button>
          )}
          {/* Publier — création ou brouillon */}
          {(!isEdit || currentStatus === 'DRAFT') && (
            <button type="button" disabled={isPublishing || !title.trim()} onClick={handlePublish}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#8B1A1A',
                              }}>
              {isPublishing
                ? <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Publication…
                  </span>
                : 'Publier le spectacle'}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
