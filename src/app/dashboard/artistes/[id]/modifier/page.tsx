import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArtistForm } from '../../_components/ArtistForm'

interface Props {
  params: { id: string }
}

export default async function ModifierArtistePage({ params }: Props) {
  let artist
  try {
    artist = await prisma.artist.findUnique({ where: { id: params.id } })
  } catch {
    notFound()
  }

  if (!artist) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Modifier l'artiste</h1>
        <p className="text-sm text-gray-400 mt-1">{artist.name}</p>
      </div>
      <ArtistForm initialData={artist} />
    </div>
  )
}
