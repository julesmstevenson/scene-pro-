'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10)

async function resizeImage(file: File, maxW = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW }
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
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
type SaveStatus = 'idle' | 'saving' | 'saved'

// ─── Style constants ──────────────────────────────────────────────────────────

const INPUT = [
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm',
  'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow',
].join(' ')

const ICON_BTN = [
  'p-1.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors',
  'disabled:opacity-30 disabled:cursor-not-allowed',
].join(' ')

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: '#0f0f1a' }}
        >
          {n}
        </span>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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

// ─── Main component ───────────────────────────────────────────────────────────

export function SpectacleForm() {
  const router = useRouter()

  // Form state
  const [title, setTitle]           = useState('')
  const [description, setDesc]      = useState('')
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [imgData, setImgData]       = useState<string | null>(null)
  const [sessions, setSessions]     = useState<SessionRow[]>([{ id: uid(), date: '', time: '' }])
  const [prices, setPrices]         = useState<PriceRow[]>([
    { id: uid(), name: 'Plein tarif', price: '25' },
    { id: uid(), name: 'Réduit',      price: '18' },
  ])

  // Save state
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved]     = useState<string | null>(null)
  const [isPublishing, setPublishing] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Keep a ref for the eventId to avoid stale closure in auto-save
  const eventIdRef = useRef<string | null>(null)

  // Keep a ref to latest form state so auto-save reads current values
  const formRef = useRef({ title, description, imgData, sessions, prices })
  useEffect(() => {
    formRef.current = { title, description, imgData, sessions, prices }
  }, [title, description, imgData, sessions, prices])

  // ── Save logic ──────────────────────────────────────────────────────────────

  const buildPayload = (
    { title, description, imgData, sessions, prices }:
    typeof formRef.current,
    status: 'DRAFT' | 'PUBLISHED',
  ) => ({
    title:       title.trim(),
    description: description.trim() || null,
    imageUrl:    imgData,
    status,
    sessions: sessions
      .filter(s => s.date && s.time)
      .map(({ date, time }) => ({ date, time })),
    priceCategories: prices
      .filter(p => p.name.trim() && p.price)
      .map(({ name, price }) => ({
        name:  name.trim(),
        price: Math.round(parseFloat(price) * 100),
      })),
  })

  const doSave = useCallback(async (
    formData: typeof formRef.current,
    status: 'DRAFT' | 'PUBLISHED',
  ): Promise<string | null> => {
    if (!formData.title.trim()) return null

    setSaveStatus('saving')
    try {
      const id      = eventIdRef.current
      const payload = buildPayload(formData, status)
      const res     = id
        ? await fetch(`/api/events/${id}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
          })
        : await fetch('/api/events', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
          })

      if (!res.ok) throw new Error(await res.text())

      const json  = await res.json()
      const newId = json.data.id
      if (!eventIdRef.current) eventIdRef.current = newId

      const now = new Date()
      setLastSaved(
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      )
      setSaveStatus('saved')
      return newId
    } catch (e) {
      console.error(e)
      setSaveStatus('idle')
      return null
    }
  }, []) // stable — reads from refs/params

  // Auto-save every 30 s
  useEffect(() => {
    const interval = setInterval(() => {
      doSave(formRef.current, 'DRAFT')
    }, 30_000)
    return () => clearInterval(interval)
  }, [doSave])

  // ── Image handling ──────────────────────────────────────────────────────────

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setError('Image trop lourde (max 5 Mo)'); return }
    setError(null)
    setImgPreview(URL.createObjectURL(file))
    try {
      const data = await resizeImage(file)
      setImgData(data)
    } catch {
      setError("Impossible de lire l'image")
    }
  }

  function removeImage() {
    setImgPreview(null)
    setImgData(null)
  }

  // ── Sessions helpers ────────────────────────────────────────────────────────

  function updateSession(id: string, field: keyof Omit<SessionRow, 'id'>, value: string) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function duplicateSession(id: string) {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === id)
      const copy = { ...prev[idx], id: uid() }
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]
    })
  }

  function removeSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  // ── Prices helpers ──────────────────────────────────────────────────────────

  function updatePrice(id: string, field: keyof Omit<PriceRow, 'id'>, value: string) {
    setPrices(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  function removePrice(id: string) {
    setPrices(prev => prev.filter(p => p.id !== id))
  }

  // ── Publish ─────────────────────────────────────────────────────────────────

  async function handlePublish() {
    if (!title.trim()) { setError('Le titre du spectacle est obligatoire'); return }
    setError(null)
    setPublishing(true)
    const id = await doSave(formRef.current, 'PUBLISHED')
    setPublishing(false)
    if (id) {
      router.push('/dashboard/spectacles')
    } else {
      setError('Erreur lors de la publication. Vérifiez votre connexion.')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-12">

      {/* ── Section 1 : Infos ─────────────────────────────────────────────── */}
      <Section n={1} title="Informations générales">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Titre du spectacle <span style={{ color: '#8B1A1A' }}>*</span>
            </label>
            <input
              className={INPUT}
              placeholder="ex : Roméo et Juliette"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Description courte
            </label>
            <textarea
              className={`${INPUT} resize-none`}
              rows={4}
              placeholder="Synopsis, note d'intention, distribution…"
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
        </div>
      </Section>

      {/* ── Section 2 : Affiche ───────────────────────────────────────────── */}
      <Section n={2} title="Affiche">
        {imgPreview ? (
          <div className="relative inline-block">
            <img
              src={imgPreview}
              alt="Aperçu affiche"
              className="h-64 w-auto rounded-lg object-cover shadow-md"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
              title="Supprimer l'image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center gap-3 h-52 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-colors group"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) handleFile(file)
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                Déposer une image ou{' '}
                <span style={{ color: '#C9A84C' }}>parcourir</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 5 Mo</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </label>
        )}
      </Section>

      {/* ── Section 3 : Séances ───────────────────────────────────────────── */}
      <Section n={3} title="Séances">
        <div className="space-y-2.5">
          {sessions.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Date</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Heure</span>
              <span />
              <span />
            </div>
          )}
          {sessions.map(s => (
            <div key={s.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
              <input
                type="date"
                className={INPUT}
                value={s.date}
                onChange={e => updateSession(s.id, 'date', e.target.value)}
              />
              <input
                type="time"
                className={INPUT}
                value={s.time}
                onChange={e => updateSession(s.id, 'time', e.target.value)}
              />
              <button
                type="button"
                title="Dupliquer cette séance"
                className={ICON_BTN}
                onClick={() => duplicateSession(s.id)}
              >
                <DuplicateIcon />
              </button>
              <button
                type="button"
                title="Supprimer"
                className={ICON_BTN}
                disabled={sessions.length === 1}
                onClick={() => removeSession(s.id)}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          <AddButton
            onClick={() => setSessions(prev => [...prev, { id: uid(), date: '', time: '' }])}
            label="Ajouter une séance"
          />
        </div>
      </Section>

      {/* ── Section 4 : Tarifs ────────────────────────────────────────────── */}
      <Section n={4} title="Tarifs">
        <div className="space-y-2.5">
          {prices.length > 0 && (
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Nom du tarif</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 w-32 text-right">Prix (€)</span>
              <span />
            </div>
          )}
          {prices.map(p => (
            <div key={p.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <input
                className={INPUT}
                placeholder="ex : Plein tarif"
                value={p.name}
                onChange={e => updatePrice(p.id, 'name', e.target.value)}
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className={`${INPUT} w-28 text-right`}
                  placeholder="0,00"
                  value={p.price}
                  onChange={e => updatePrice(p.id, 'price', e.target.value)}
                />
                <span className="text-sm font-medium text-gray-400">€</span>
              </div>
              <button
                type="button"
                title="Supprimer ce tarif"
                className={ICON_BTN}
                onClick={() => removePrice(p.id)}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          <AddButton
            onClick={() => setPrices(prev => [...prev, { id: uid(), name: '', price: '' }])}
            label="Ajouter un tarif"
          />
        </div>
      </Section>

      {/* ── Erreur ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        {/* Statut sauvegarde */}
        <div className="flex items-center gap-2 text-xs text-gray-400 min-h-[20px]">
          {saveStatus === 'saving' && (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
              Sauvegarde en cours…
            </>
          )}
          {saveStatus === 'saved' && lastSaved && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              Brouillon sauvegardé à {lastSaved}
            </>
          )}
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => doSave(formRef.current, 'DRAFT')}
            disabled={!title.trim()}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Enregistrer le brouillon
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || !title.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)',
              boxShadow: (!isPublishing && !!title.trim())
                ? '0 4px 14px rgba(139,26,26,0.35)'
                : undefined,
            }}
          >
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
