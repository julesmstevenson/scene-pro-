import Link from 'next/link'
import { SpectacleForm } from './_components/SpectacleForm'

export default function NouveauSpectaclePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard/spectacles" className="hover:text-gray-600 transition-colors">
          Spectacles
        </Link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-gray-600">Nouveau spectacle</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Nouveau spectacle</h1>
        <p className="text-sm text-gray-400 mt-1">Créez et publiez votre spectacle en moins de 2 minutes</p>
      </div>

      <SpectacleForm />
    </div>
  )
}
