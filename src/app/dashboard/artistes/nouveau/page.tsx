import { ArtistForm } from '../_components/ArtistForm'

export default function NouvelArtistePage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Nouvel artiste</h1>
        <p className="text-sm text-gray-400 mt-1">Renseignez les informations de l'artiste</p>
      </div>
      <ArtistForm />
    </div>
  )
}
