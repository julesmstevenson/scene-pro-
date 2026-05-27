import Link from 'next/link'
import { ArtistForm } from '../_components/ArtistForm'

export default function NouvelArtistePage() {
  return (
    <div className="px-10 py-10 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-300 mb-8">
        <Link href="/dashboard/artistes" className="hover:text-gray-500 transition-colors">
          Artistes
        </Link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-gray-400">Nouvel artiste</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 leading-none">Nouvel artiste</h1>
        <p className="text-sm text-gray-400 mt-2">Renseignez les informations de l'artiste</p>
      </div>

      <ArtistForm />
    </div>
  )
}
