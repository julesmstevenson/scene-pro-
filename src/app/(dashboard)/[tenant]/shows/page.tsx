import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Plus, Clock, Eye, EyeOff } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'

type Props = { params: { tenant: string } }

export default async function ShowsPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) notFound()

  const shows = await prisma.show.findMany({
    where: { theaterId: theater.id },
    include: {
      venue: { select: { name: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Spectacles" subtitle={`${shows.length} spectacle${shows.length !== 1 ? 's' : ''}`} />

      <div className="p-8">
        <div className="flex justify-end mb-6">
          <Link
            href={`/${params.tenant}/shows/new`}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau spectacle
          </Link>
        </div>

        {shows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">Aucun spectacle pour le moment</p>
            <Link
              href={`/${params.tenant}/shows/new`}
              className="text-brand-600 text-sm font-medium hover:underline"
            >
              Créer votre premier spectacle →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {shows.map((show) => (
              <Link
                key={show.id}
                href={`/${params.tenant}/shows/${show.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-brand-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                      {show.title}
                    </h3>
                    {show.genre && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {show.genre}
                      </span>
                    )}
                  </div>
                  <div className="ml-2 shrink-0">
                    {show.isPublished
                      ? <Eye className="w-4 h-4 text-green-500" />
                      : <EyeOff className="w-4 h-4 text-gray-300" />
                    }
                  </div>
                </div>

                {show.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{show.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {show.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {show.duration} min
                    </span>
                  )}
                  <span>{show._count.sessions} séance{show._count.sessions !== 1 ? 's' : ''}</span>
                  {show.venue && <span>{show.venue.name}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
