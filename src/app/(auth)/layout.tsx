import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 55%, #16213e 100%)' }}
    >
      {/* Spotlight glow from top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(201,168,76,0.13) 0%, transparent 68%)',
        }}
      />

      {/* Masque de comédie – coin bas-gauche */}
      <svg
        viewBox="0 0 100 110"
        className="absolute bottom-8 left-8 w-44 h-48 pointer-events-none"
        style={{ opacity: 0.06 }}
        fill="#C9A84C"
        aria-hidden="true"
      >
        <ellipse cx="50" cy="58" rx="46" ry="50" fill="none" stroke="#C9A84C" strokeWidth="3" />
        <ellipse cx="32" cy="47" rx="7" ry="8" />
        <ellipse cx="68" cy="47" rx="7" ry="8" />
        <path d="M22 72 Q50 93 78 72" fill="none" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round" />
        {/* Couronne */}
        <path d="M16 24 L30 8 L50 20 L70 8 L84 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Masque de tragédie – coin haut-droit */}
      <svg
        viewBox="0 0 100 110"
        className="absolute top-8 right-8 w-36 h-40 pointer-events-none"
        style={{ opacity: 0.06 }}
        fill="#C9A84C"
        aria-hidden="true"
      >
        <ellipse cx="50" cy="58" rx="46" ry="50" fill="none" stroke="#C9A84C" strokeWidth="3" />
        <ellipse cx="32" cy="45" rx="7" ry="8" />
        <ellipse cx="68" cy="45" rx="7" ry="8" />
        {/* Larmes */}
        <path d="M32 55 Q30 64 28 72" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M68 55 Q66 64 64 72" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
        {/* Bouche triste */}
        <path d="M22 80 Q50 64 78 80" fill="none" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Étoiles décoratives */}
      <svg
        viewBox="0 0 200 200"
        className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
        style={{ opacity: 0.04 }}
        aria-hidden="true"
      >
        {[
          [40, 40], [100, 20], [160, 60], [20, 120], [80, 160], [150, 140],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="#C9A84C" />
        ))}
        {[
          [130, 40], [60, 90], [170, 100],
        ].map(([cx, cy], i) => (
          <circle key={i + 10} cx={cx} cy={cy} r="1.5" fill="#C9A84C" />
        ))}
      </svg>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8 z-10">
        <span
          className="font-serif text-3xl font-bold tracking-wide"
          style={{ color: '#C9A84C' }}
        >
          Scène
        </span>
        <span
          className="text-sm font-light tracking-[0.35em] uppercase mt-1"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          Pro
        </span>
      </Link>

      {/* Carte formulaire */}
      <div
        className="w-full max-w-md rounded-2xl p-8 z-10"
        style={{
          backgroundColor: '#FEFDFB',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        {children}
      </div>

      {/* Baseline */}
      <p
        className="mt-6 text-xs z-10 tracking-[0.25em] uppercase"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        Billetterie professionnelle
      </p>
    </div>
  )
}
