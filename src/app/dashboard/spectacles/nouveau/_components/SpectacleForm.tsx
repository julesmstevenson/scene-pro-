'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)

async function resizeImage(file: File, maxW = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img    = new Image()
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

interface SessionRow  { id: string; date: string; time: string }
interface PriceRow    { id: string; name: string; price: string }
interface PersonRow   { id: string; role: string; name: string }
type SaveStatus = 'idle' | 'saving' | 'saved'

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT = [
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm',
  'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow',
].join(' ')

const ICON_BTN = [
  'p-1.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors',
  'disabled:opacity-30 disabled:cursor-not-allowed',
].join(' ')

// ─── Sous-composants ──────────────────────────────────────────────────────────

function Section({ n, title, hint, children }: {
  n: number; title: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: '#0f0f1a' }}
        >
          {n}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide leading-none">
            {title}
          </h2>
          {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
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
      style={{ color: '#C9A84C' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {label}
    </button>
  )
}

// ─── Genres suggérés ──────────────────────────────────────────────────────────

const GENRE_SUGGESTIONS = [
  'Comédie', 'Drame', 'Comédie dramatique', 'Théâtre contemporain',
  'Classique', 'Comédie musicale', 'One man show', 'One woman show',
  'Café-théâtre', 'Jeune public', 'Cirque', 'Performance',
]

// ─── Composant principal ──────────────────────────────────────────────────────

export function SpectacleForm() {
  const router = useRouter()

  // — Infos générales
  const [title,       setTitle]    = useState('')
  const [description, setDesc]     = useState('')
  const [author,      setAuthor]   = useState('')
  const [director,    setDirector] = useState('')
  const [duration,    setDuration] = useState('')
  const [genre,       setGenre]    = useState('')

  // — Visuel
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [imgData,    setImgData]    = useState<string | null>(null)

  // — Distribution
  const [cast, setCast] = useState<PersonRow[]>([
    { id: uid(), role: '', name: '' },
  ])

  // — Équipe créative
  const [creativeTeam, setCreativeTeam] = useState<PersonRow[]>([
    { id: uid(), role: 'Mise en scène',  name: '' },
    { id: uid(), role: 'Scénographie',   name: '' },
    { id: uid(), role: 'Costumes',       name: '' },
    { id: uid(), role: 'Lumières',       name: '' },
    { id: uid(), role: 'Son',            name: '' },
  ])

  // — Séances
  const [sessions, setSessions] = useState<SessionRow[]>([
    { id: uid(), date: '', time: '' },
  ])

  // — Tarifs
  const [prices, setPrices] = useState<PriceRow[]>([
    { id: uid(), name: 'Plein tarif', price: '25' },
    { id: uid(), name: 'Réduit',      price: '18' },
  ])

  // — Sauvegarde
  const [saveStatus,   setSaveStatus]  = useState<SaveStatus>('idle')
  const [lastSaved,    setLastSaved]   = useState<string | null>(null)
  const [isPublishing, setPublishing]  = useState(false)
  const [error,        setError]       = useState<string | null>(null)

  const eventIdRef = useRef<string | null>(null)
  const formRef    = useRef({
    title, description, author, director, duration, genre,
    imgData, cast, creativeTeam, sessions, prices,
  })
  useEffect(() => {
    formRef.current = {
      title, description, author, director, duration, genre,
      imgData, cast, creativeTeam, sessions, prices,
    }
  }, [title, description, author, director, duration, genre,
      imgData, cast, creativeTeam, sessions, prices])

  // ── Payload ──────────────────────────────────────────────────────────────────

  function buildPayload(
    f: typeof formRef.current,
    status: 'DRAFT' | 'PUBLISHED',
  ) {
    return {
      title:       f.title.trim(),
      description: f.description.trim() || null,
      imageUrl:    f.imgData,
      author:      f.author.trim()   || null,
      director:    f.director.trim() || null,
      duration:    f.duration.trim() || null,
      genre:       f.genre.trim()    || null,
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
        .map(({ role, name }) => ({ role: role.trim(), name: name.trim() })),
      creativeTeam: f.creativeTeam
        .filter(c => c.name.trim())
        .map(({ role, name }) => ({ role: role.trim(), name: name.trim() })),
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
      setLastSaved(
        new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      )
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
    <div className="space-y-5 pb-12">

      {/* ① Informations générales ─────────────────────────────────────────── */}
      <Section n={1} title="Informations générales">
        <div className="space-y-4">

          {/* Titre */}
          <div>
            <FieldLabel>Titre du spectacle <span style={{ color: '#8B1A1A' }}>*</span></FieldLabel>
            <input className={INPUT} placeholder="ex : Roméo et Juliette"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <FieldLabel optional>Synopsis / description</FieldLabel>
            <textarea className={`${INPUT} resize-none`} rows={4}
              placeholder="Synopsis, propos du spectacle, note d'intention…"
              value={description} onChange={e => setDesc(e.target.value)} />
          </div>

          {/* Auteur + Metteur en scène */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel optional>Auteur</FieldLabel>
              <input className={INPUT} placeholder="ex : Molière"
                value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <div>
              <FieldLabel optional>Mise en scène</FieldLabel>
              <input className={INPUT} placeholder="ex : Marie Dupont"
                value={director} onChange={e => setDirector(e.target.value)} />
            </div>
          </div>

          {/* Durée + Genre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel optional>Durée</FieldLabel>
              <input className={INPUT} placeholder="ex : 1h15, 2h avec entracte"
                value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <FieldLabel optional>Genre</FieldLabel>
              <input
                className={INPUT}
                placeholder="ex : Comédie, Drame…"
                list="genre-suggestions"
                value={genre}
                onChange={e => setGenre(e.target.value)}
              />
              <datalist id="genre-suggestions">
                {GENRE_SUGGESTIONS.map(g => <option key={g} value={g} />)}
              </datalist>
            </div>
          </div>

        </div>
      </Section>

      {/* ② Affiche ──────────────────────────────────────────────────────────── */}
      <Section n={2} title="Affiche" hint="JPG, PNG, WebP · Max 5 Mo">
        {imgPreview ? (
          <div className="relative inline-block">
            <img src={imgPreview} alt="Aperçu affiche" className="h-64 w-auto rounded-lg object-cover shadow-md" />
            <button type="button" onClick={() => { setImgPreview(null); setImgData(null) }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center gap-3 h-52 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-colors group"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                Déposer une image ou <span style={{ color: '#C9A84C' }}>parcourir</span>
              </p>
            </div>
            <input type="file" accept="image/*" className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </label>
        )}
      </Section>

      {/* ③ Distribution ─────────────────────────────────────────────────────── */}
      <Section n={3} title="Distribution" hint="Comédiens et personnages interprétés">
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
              <input className={INPUT} placeholder="ex : Jean Martin"
                value={c.name}
                onChange={e => setCast(prev => prev.map(r => r.id === c.id ? { ...r, name: e.target.value } : r))} />
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
      </Section>

      {/* ④ Équipe créative ──────────────────────────────────────────────────── */}
      <Section n={4} title="Équipe créative" hint="Metteur en scène, scénographe, costumier…">
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
              <input className={INPUT} placeholder="ex : Sophie Bernard"
                value={c.name}
                onChange={e => setCreativeTeam(prev => prev.map(r => r.id === c.id ? { ...r, name: e.target.value } : r))} />
              <button type="button" className={ICON_BTN}
                onClick={() => setCreativeTeam(prev => prev.filter(r => r.id !== c.id))}>
                <TrashIcon />
              </button>
            </div>
          ))}
          <AddButton
            onClick={() => setCreativeTeam(prev => [...prev, { id: uid(), role: '', name: '' }])}
            label="Ajouter un membre" />
        </div>
      </Section>

      {/* ⑤ Séances ──────────────────────────────────────────────────────────── */}
      <Section n={5} title="Séances" hint="Dates et horaires des représentations">
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
                  setSessions(prev => [...prev.slice(0, idx + 1), { ...s, id: uid() }, ...prev.slice(idx + 1)])
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
      </Section>

      {/* ⑥ Tarifs ───────────────────────────────────────────────────────────── */}
      <Section n={6} title="Tarifs">
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
      </Section>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 min-h-[20px]">
          {saveStatus === 'saving' && (
            <><span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />Sauvegarde…</>
          )}
          {saveStatus === 'saved' && lastSaved && (
            <><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />Brouillon sauvegardé à {lastSaved}</>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" disabled={!title.trim()}
            onClick={() => doSave(formRef.current, 'DRAFT')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Enregistrer le brouillon
          </button>
          <button type="button" disabled={isPublishing || !title.trim()} onClick={handlePublish}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:  'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)',
              boxShadow: (!isPublishing && !!title.trim()) ? '0 4px 14px rgba(139,26,26,0.35)' : undefined,
            }}>
            {isPublishing
              ? <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Publication…
                </span>
              : 'Publier le spectacle'}
          </button>
        </div>
      </div>
    </div>
  )
}
