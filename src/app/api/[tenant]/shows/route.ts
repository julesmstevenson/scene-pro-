import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { tenant: string } }

async function getTheater(slug: string, userId: string) {
  return prisma.theater.findFirst({
    where: {
      slug,
      memberships: { some: { userId } },
    },
  })
}

export async function GET(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await getTheater(params.tenant, session.user.id)
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  const shows = await prisma.show.findMany({
    where: { theaterId: theater.id },
    include: {
      venue: { select: { id: true, name: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: shows })
}

const createSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  genre:       z.string().optional(),
  duration:    z.number().int().positive().optional(),
  ageRating:   z.string().optional(),
  venueId:     z.string().optional(),
  isPublished: z.boolean().default(false),
})

export async function POST(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await getTheater(params.tenant, session.user.id)
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  try {
    const body   = await req.json()
    const data   = createSchema.parse(body)
    const show   = await prisma.show.create({ data: { ...data, theaterId: theater.id } })
    return NextResponse.json({ data: show }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
