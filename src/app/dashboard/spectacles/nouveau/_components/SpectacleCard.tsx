'use client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardTemplate = 'classique' | 'minimal' | 'affiche' | 'moderne'

export interface CardData {
  title:        string
  author?:      string | null
  director?:    string | null
  duration?:    string | null
  genre?:       string | null
  imageUrl?:    string | null
  firstSession?: { date: string; time: string } | null
  priceFrom?:   number | null  // en centimes
}

export const TEMPLATES: { id: CardTemplate; label: string }[] = [
  { id: 'classique', label: 'Classique' },
  { id: 'minimal',   label: 'Minimal'   },
  { id: 'affiche',   label: 'Affiche'   },
  { id: 'moderne',   label: 'Moderne'   },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const CARD_W = 260
export const CARD_H = 340

function fmt(date: string) {
  return new Date(date + 'T00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short',
  })
}

function euros(cents: number) {
  return `${Math.round(cents / 100)} €`
}

const SERIF  = 'var(--font-playfair), Georgia, serif'
const SANS   = 'var(--font-inter), system-ui, sans-serif'

// ─── Classique ────────────────────────────────────────────────────────────────
// Fond sombre théâtral, titre en serif doré, ambiance luxe discret

function ClassiqueCard({ data }: { data: CardData }) {
  return (
    <div style={{ width: CARD_W, height: CARD_H, backgroundColor: '#0f0f1a', borderRadius: 14, overflow: 'hidden', fontFamily: SANS, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Image / fond scène */}
      <div style={{ height: 168, position: 'relative', backgroundColor: '#16213e', flexShrink: 0 }}>
        {data.imageUrl
          ? <img src={data.imageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 100 110" style={{ width: 60, height: 66, opacity: 0.12 }} fill="#C9A84C" aria-hidden="true">
                <ellipse cx="50" cy="58" rx="46" ry="50" fill="none" stroke="#C9A84C" strokeWidth="3" />
                <ellipse cx="32" cy="47" rx="7" ry="8" />
                <ellipse cx="68" cy="47" rx="7" ry="8" />
                <path d="M22 72 Q50 93 78 72" fill="none" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          )
        }
        {/* Gradient bas */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f0f1a 0%, transparent 55%)' }} />
        {/* Badge genre */}
        {data.genre && (
          <div style={{ position: 'absolute', top: 12, left: 14 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', padding: '2px 8px', border: '1px solid rgba(201,168,76,0.45)', borderRadius: 20 }}>
              {data.genre}
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '14px 18px 18px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: '#FEFDFB', lineHeight: 1.25, marginBottom: 10 }}>
          {data.title || <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Titre du spectacle</span>}
        </div>

        <div style={{ width: 28, height: 1, backgroundColor: 'rgba(201,168,76,0.4)', marginBottom: 10 }} />

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {data.author    && <span>✍ {data.author}</span>}
          {data.director  && <span style={{ color: 'rgba(255,255,255,0.35)' }}>Mis en scène par {data.director}</span>}
          {data.duration  && <span>⏱ {data.duration}</span>}
        </div>

        {(data.firstSession || data.priceFrom) && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {data.firstSession
              ? <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>📅 {fmt(data.firstSession.date)}</span>
              : <span />}
            {data.priceFrom
              ? <span style={{ fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>Dès {euros(data.priceFrom)}</span>
              : null}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Minimal ──────────────────────────────────────────────────────────────────
// Blanc, barre bordeaux, typographie éditoriale

function MinimalCard({ data }: { data: CardData }) {
  return (
    <div style={{ width: CARD_W, height: CARD_H, backgroundColor: '#FEFDFB', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', fontFamily: SANS, flexShrink: 0 }}>
      {/* Barre accent bordeaux */}
      <div style={{ width: 4, backgroundColor: '#8B1A1A', flexShrink: 0 }} />

      {/* Contenu */}
      <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Miniature si image */}
        {data.imageUrl && (
          <div style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 14, flexShrink: 0 }}>
            <img src={data.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          </div>
        )}

        {data.genre && (
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 8, display: 'block' }}>
            {data.genre}
          </span>
        )}

        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.25, marginBottom: 10 }}>
          {data.title || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Titre du spectacle</span>}
        </div>

        <div style={{ width: '100%', height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 }} />

        <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {data.author   && <span>Auteur · <span style={{ color: '#6b7280' }}>{data.author}</span></span>}
          {data.director && <span>Mise en scène · <span style={{ color: '#6b7280' }}>{data.director}</span></span>}
          {data.duration && <span>Durée · <span style={{ color: '#6b7280' }}>{data.duration}</span></span>}
        </div>

        {(data.firstSession || data.priceFrom) && (
          <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {data.firstSession
              ? <span style={{ fontSize: 11, color: '#9ca3af' }}>{fmt(data.firstSession.date)}</span>
              : <span />}
            {data.priceFrom
              ? <span style={{ fontSize: 12, fontWeight: 700, color: '#8B1A1A' }}>Dès {euros(data.priceFrom)}</span>
              : null}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Affiche ──────────────────────────────────────────────────────────────────
// Pleine image, texte en superposition — style cinéma

function AfficheCard({ data }: { data: CardData }) {
  return (
    <div style={{ width: CARD_W, height: CARD_H, borderRadius: 14, overflow: 'hidden', position: 'relative', fontFamily: SANS, flexShrink: 0 }}>
      {/* Fond : image ou dégradé théâtral */}
      {data.imageUrl
        ? <img src={data.imageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1a1a2e 0%, #0f0f1a 100%)' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.08 }}>
              <svg viewBox="0 0 100 110" style={{ width: 120, height: 132 }} fill="#C9A84C" aria-hidden="true">
                <ellipse cx="50" cy="58" rx="46" ry="50" fill="none" stroke="#C9A84C" strokeWidth="2" />
                <ellipse cx="32" cy="47" rx="7" ry="8" />
                <ellipse cx="68" cy="47" rx="7" ry="8" />
                <path d="M22 72 Q50 93 78 72" fill="none" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
      }

      {/* Overlay dégradé */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.05) 100%)' }} />

      {/* Badge genre — haut droite */}
      {data.genre && (
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white', backgroundColor: '#8B1A1A', padding: '3px 10px', borderRadius: 20 }}>
            {data.genre}
          </span>
        </div>
      )}

      {/* Contenu — bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 8, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {data.title || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>Titre du spectacle</span>}
        </div>
        <div style={{ width: 36, height: 2, backgroundColor: '#C9A84C', marginBottom: 10 }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', display: 'flex', flexWrap: 'wrap', gap: '3px 10px' }}>
          {data.author   && <span>{data.author}</span>}
          {data.duration && <span>{data.duration}</span>}
          {data.firstSession && <span>{fmt(data.firstSession.date)} · {data.firstSession.time}</span>}
        </div>
        {data.priceFrom && (
          <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>
            Dès {euros(data.priceFrom)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Moderne ──────────────────────────────────────────────────────────────────
// Blanc épuré, image en bandeau haut, typographie sans-serif nette

function ModerneCard({ data }: { data: CardData }) {
  return (
    <div style={{ width: CARD_W, height: CARD_H, backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', fontFamily: SANS, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Bandeau image */}
      <div style={{ height: 140, backgroundColor: '#f3f4f6', position: 'relative', flexShrink: 0 }}>
        {data.imageUrl
          ? <img src={data.imageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
                <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          )
        }
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3, flex: 1 }}>
            {data.title || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Titre du spectacle</span>}
          </div>
          {data.genre && (
            <span style={{ fontSize: 9, fontWeight: 600, color: '#a8893a', backgroundColor: 'rgba(201,168,76,0.12)', padding: '2px 8px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
              {data.genre}
            </span>
          )}
        </div>

        {(data.author || data.director) && (
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
            {[data.author, data.director && `Mis en scène par ${data.director}`].filter(Boolean).join(' · ')}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
          {data.duration && (
            <span style={{ fontSize: 10, color: '#6b7280', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 20 }}>
              ⏱ {data.duration}
            </span>
          )}
          {data.firstSession && (
            <span style={{ fontSize: 10, color: '#6b7280', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 20 }}>
              📅 {fmt(data.firstSession.date)}
            </span>
          )}
          {data.priceFrom && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'white', backgroundColor: '#8B1A1A', padding: '2px 10px', borderRadius: 20 }}>
              Dès {euros(data.priceFrom)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function SpectacleCard({ data, template }: { data: CardData; template: CardTemplate }) {
  switch (template) {
    case 'classique': return <ClassiqueCard data={data} />
    case 'minimal':   return <MinimalCard   data={data} />
    case 'affiche':   return <AfficheCard   data={data} />
    case 'moderne':   return <ModerneCard   data={data} />
    default:          return <ClassiqueCard data={data} />
  }
}
