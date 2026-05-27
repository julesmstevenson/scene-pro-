import Link from 'next/link'

// Petit cube isométrique — logo mark Scène Pro
function CubeMark({ size = 40 }: { size?: number }) {
  const s = size
  // Cube isométrique en 3 faces
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
      {/* Face supérieure */}
      <path
        d="M20 4L36 13V14L20 23L4 14V13L20 4Z"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* Face gauche */}
      <path
        d="M4 14L20 23V37L4 28V14Z"
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* Face droite */}
      <path
        d="M36 14L20 23V37L36 28V14Z"
        fill="rgba(139,26,26,0.25)"
        stroke="rgba(139,26,26,0.7)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* Arête centrale verticale */}
      <line x1="20" y1="23" x2="20" y2="37" stroke="rgba(255,255,255,0.15)" strokeWidth="0.9" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: '#080808' }}
    >
      {/* Contenu centré */}
      <div className="flex flex-col items-center text-center px-6 max-w-xl">

        {/* Logo mark */}
        <div className="mb-8">
          <CubeMark size={44} />
        </div>

        {/* Wordmark */}
        <h2
          className="font-serif text-5xl font-bold tracking-tight leading-none mb-1"
          style={{ color: '#ffffff' }}
        >
          Scène Pro
        </h2>

        {/* Séparateur */}
        <div
          className="w-6 h-px my-8"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        />

        {/* Accroche */}
        <p
          className="text-[17px] leading-relaxed font-medium mb-2"
          style={{ color: 'rgba(255,255,255,0.82)' }}
        >
          Bienvenue sur Scène Pro
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Votre outil de gestion de billetterie<br />
          fait sur mesure pour les professionnels du spectacle.
        </p>

        {/* CTA */}
        <Link
          href="/dashboard/spectacles"
          className="mt-10 inline-flex items-center gap-2.5 px-7 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ backgroundColor: '#8B1A1A', color: '#ffffff' }}
        >
          Commencer le paramétrage
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

      </div>

      {/* Mention bas */}
      <p
        className="absolute bottom-8 text-[10px] tracking-[0.2em] uppercase"
        style={{ color: 'rgba(255,255,255,0.1)' }}
      >
        Billetterie professionnelle
      </p>

    </main>
  )
}
