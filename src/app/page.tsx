import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Scène Pro</h1>
        <p className="text-gray-500 mb-8 text-lg">
          La plateforme de billetterie pour les théâtres professionnels
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="bg-violet-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:border-gray-300 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  )
}
