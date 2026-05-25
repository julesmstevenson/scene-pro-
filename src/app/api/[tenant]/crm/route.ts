import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { tenant: string } }

export async function GET(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''

  const spectators = await prisma.spectator.findMany({
    where: {
      theaterId: theater.id,
      ...(q ? {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName:  { contains: q, mode: 'insensitive' } },
          { email:     { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      loyaltyAccount: true,
      _count: { select: { reservations: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ data: spectators })
}

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  phone:     z.string().optional(),
  city:      z.string().optional(),
  notes:     z.string().optional(),
})

export async function POST(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  try {
    const data = createSchema.parse(await req.json())

    const spectator = await prisma.spectator.create({
      data: { ...data, theaterId: theater.id },
    })

    await prisma.loyaltyAccount.create({ data: { spectatorId: spectator.id } })

    return NextResponse.json({ data: spectator }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
