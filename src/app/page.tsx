import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0a0a14' }}
    >

      {/* Texture — grain très subtil via radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,26,26,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139,26,26,0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* Ligne décorative centrale */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 opacity-20"
        style={{ background: 'linear-gradient(to bottom, transparent, #8B1A1A)' }}
      />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Logo */}
        <div className="mb-10">
          <p
            className="font-serif text-6xl font-bold tracking-tight leading-none"
            style={{ color: '#ffffff' }}
          >
            Scène
          </p>
          <p
            className="text-[11px] tracking-[0.45em] uppercase mt-2 font-medium"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Pro
          </p>
        </div>

        {/* Séparateur */}
        <div
          className="w-8 h-px mb-10"
          style={{ backgroundColor: '#8B1A1A' }}
        />

        {/* Accroche */}
        <h1
          className="font-serif text-2xl font-semibold leading-relaxed mb-3"
          style={{ color: 'rgba(255,255,255,0.88)' }}
        >
          Bienvenue sur Scène Pro
        </h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.38)' }}
        >
          Votre outil de gestion de billetterie<br />
          fait sur mesure pour les professionnels du spectacle.
        </p>

        {/* CTA */}
        <Link
          href="/dashboard/spectacles"
          className="mt-12 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#8B1A1A', color: '#ffffff' }}
        >
          Commencer le paramétrage
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

      </div>

      {/* Ligne décorative bas */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 opacity-20"
        style={{ background: 'linear-gradient(to top, transparent, #8B1A1A)' }}
      />

      {/* Mention bas de page */}
      <p
        className="absolute bottom-8 text-[10px] tracking-[0.2em] uppercase"
        style={{ color: 'rgba(255,255,255,0.12)' }}
      >
        Billetterie professionnelle
      </p>

    </main>
  )
}
