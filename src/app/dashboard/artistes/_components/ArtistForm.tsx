'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Artist } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT = [
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm',
  'focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow',
].join(' ')

// ─── Sous-composants ──────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
      {optional && (
        <span className="ml-1 text-gray-300 font-normal normal-case tracking-normal">
          — facultatif
        </span>
      )}
    </label>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArtistFormProps {
  initialData?: Artist
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ArtistForm({ initialData }: ArtistFormProps) {
  const router = useRouter()

  const [name,     setName]    = useState(initialData?.name     ?? '')
  const [bio,      setBio]     = useState(initialData?.bio      ?? '')
  const [email,    setEmail]   = useState(initialData?.email    ?? '')
  const [phone,    setPhone]   = useState(initialData?.phone    ?? '')
  const [website,  setWebsite] = useState(initialData?.website  ?? '')

  const [imgPreview, setImgPreview] = useState<string | null>(initialData?.photoUrl ?? null)
  const [imgData,    setImgData]    = useState<string | null>(initialData?.photoUrl ?? null)

  const [isSaving,   setIsSaving]   = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const isEditing = !!initialData

  // ── Image ────────────────────────────────────────────────────────────────────

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setError('Image trop lourde (max 5 Mo)'); return }
    setError(null)
    setImgPreview(URL.createObjectURL(file))
    try {
      setImgData(await resizeImage(file))
    } catch {
      setError("Impossible de lire l'image")
    }
  }

  // ── Suppression ──────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!initialData) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/artists/${initialData.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Erreur serveur')
      }
      router.push('/dashboard/artistes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      setIsDeleting(false)
      setConfirmDel(false)
    }
  }

  // ── Sauvegarde ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est obligatoire'); return }
    setError(null)
    setIsSaving(true)

    try {
      const payload = {
        name:     name.trim(),
        bio:      bio.trim()      || null,
        photoUrl: imgData         || null,
        email:    email.trim()    || null,
        phone:    phone.trim()    || null,
        website:  website.trim()  || null,
      }

      const res = isEditing
        ? await fetch(`/api/artists/${initialData.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/artists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Erreur serveur')
      }

      router.push('/dashboard/artistes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">

        {/* Photo */}
        <div>
          <FieldLabel optional>Photo</FieldLabel>
          <p className="text-xs text-gray-400 mb-3">JPG, PNG, WebP · Max 5 Mo</p>

          {imgPreview ? (
            <div className="relative inline-block">
              <img
                src={imgPreview}
                alt="Photo de l'artiste"
                className="w-24 h-24 rounded-full object-cover shadow-md"
                style={{ border: '2px solid rgba(201,168,76,0.3)' }}
              />
              <button
                type="button"
                onClick={() => { setImgPreview(null); setImgData(null) }}
                className="absolute -top-1 -right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-3 h-3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center gap-3 h-36 w-36 border-2 border-dashed border-gray-200 rounded-full cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-colors group"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform"
                style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 text-center leading-tight px-2">
                Photo
              </p>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
            </label>
          )}
        </div>

        {/* Nom */}
        <div>
          <FieldLabel>
            Nom <span style={{ color: '#8B1A1A' }}>*</span>
          </FieldLabel>
          <input
            className={INPUT}
            placeholder="ex : Marie Dupont"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {/* Biographie */}
        <div>
          <FieldLabel optional>Biographie</FieldLabel>
          <textarea
            className={`${INPUT} resize-none`}
            rows={4}
            placeholder="Parcours artistique, formations, expériences…"
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel optional>E-mail</FieldLabel>
            <input
              type="email"
              className={INPUT}
              placeholder="ex : marie@exemple.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel optional>Téléphone</FieldLabel>
            <input
              type="tel"
              className={INPUT}
              placeholder="ex : 06 12 34 56 78"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Site web */}
        <div>
          <FieldLabel optional>Site web</FieldLabel>
          <input
            type="url"
            className={INPUT}
            placeholder="ex : https://mariedupont.fr"
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/artistes')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>

          {/* Supprimer — mode édition uniquement */}
          {isEditing && !confirmDel && (
            <button
              type="button"
              onClick={() => setConfirmDel(true)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Supprimer
            </button>
          )}
          {isEditing && confirmDel && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Confirmer ?</span>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Suppression…' : 'Oui, supprimer'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDel(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSaving || !name.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)',
            boxShadow: (!isSaving && !!name.trim()) ? '0 4px 14px rgba(139,26,26,0.35)' : undefined,
          }}
        >
          {isSaving ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Sauvegarde…
            </>
          ) : (
            isEditing ? 'Enregistrer les modifications' : 'Créer l\'artiste'
          )}
        </button>
      </div>
    </form>
  )
}
