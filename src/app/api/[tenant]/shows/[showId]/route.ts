import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { tenant: string; showId: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const show = await prisma.show.findFirst({
    where: {
      id: params.showId,
      theater: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
    },
    include: {
      venue: { include: { zones: { include: { seats: true } } } },
      sessions: { orderBy: { startsAt: 'asc' }, include: { pricings: true, _count: { select: { reservations: true } } } },
    },
  })

  if (!show) return NextResponse.json({ error: 'Spectacle introuvable' }, { status: 404 })
  return NextResponse.json({ data: show })
}

const patchSchema = z.object({
  title:       z.string().min(1).optional(),
  description: z.string().optional(),
  genre:       z.string().optional(),
  duration:    z.number().int().positive().optional(),
  ageRating:   z.string().optional(),
  isPublished: z.boolean().optional(),
}).partial()

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const show = await prisma.show.findFirst({
    where: {
      id: params.showId,
      theater: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
    },
  })
  if (!show) return NextResponse.json({ error: 'Spectacle introuvable' }, { status: 404 })

  try {
    const data    = patchSchema.parse(await req.json())
    const updated = await prisma.show.update({ where: { id: params.showId }, data })
    return NextResponse.json({ data: updated })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const show = await prisma.show.findFirst({
    where: {
      id: params.showId,
      theater: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
    },
    include: { _count: { select: { sessions: true } } },
  })
  if (!show) return NextResponse.json({ error: 'Spectacle introuvable' }, { status: 404 })
  if (show._count.sessions > 0) {
    return NextResponse.json({ error: 'Impossible de supprimer un spectacle avec des séances' }, { status: 409 })
  }

  await prisma.show.delete({ where: { id: params.showId } })
  return new NextResponse(null, { status: 204 })
}
