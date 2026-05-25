import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { tenant: string } }

export async function GET(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const showId = searchParams.get('showId')

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  const sessions = await prisma.showSession.findMany({
    where: {
      show: { theaterId: theater.id },
      ...(showId ? { showId } : {}),
    },
    include: {
      show: { select: { id: true, title: true } },
      pricings: true,
      _count: { select: { reservations: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  return NextResponse.json({ data: sessions })
}

const createSchema = z.object({
  showId:   z.string().cuid(),
  startsAt: z.string().datetime(),
  endsAt:   z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(),
  notes:    z.string().optional(),
  pricings: z.array(z.object({
    zoneId: z.string().cuid(),
    name:   z.string().min(1),
    price:  z.number().int().nonnegative(),
  })).optional(),
})

export async function POST(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  try {
    const { pricings, ...sessionData } = createSchema.parse(await req.json())

    const result = await prisma.$transaction(async (tx) => {
      const showSession = await tx.showSession.create({ data: sessionData })
      if (pricings?.length) {
        await tx.sessionPricing.createMany({
          data: pricings.map((p) => ({ ...p, sessionId: showSession.id })),
        })
      }
      return showSession
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
