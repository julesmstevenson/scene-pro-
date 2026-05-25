import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { tenant: string } }

async function requireTheater(slug: string, userId: string) {
  return prisma.theater.findFirst({
    where: { slug, memberships: { some: { userId } } },
  })
}

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await requireTheater(params.tenant, session.user.id)
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  const contracts = await prisma.resellerContract.findMany({
    where: { theaterId: theater.id },
    include: {
      reseller: true,
      quotas: { include: { session: { include: { show: { select: { title: true } } } } } },
      _count: { select: { reservations: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: contracts })
}

const createSchema = z.object({
  resellerName:   z.string().min(2),
  resellerEmail:  z.string().email(),
  commissionRate: z.number().min(0).max(100),
  startDate:      z.string().datetime(),
})

export async function POST(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await requireTheater(params.tenant, session.user.id)
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  try {
    const data = createSchema.parse(await req.json())

    const contract = await prisma.$transaction(async (tx) => {
      const reseller = await tx.reseller.upsert({
        where: { email: data.resellerEmail },
        update: { name: data.resellerName },
        create: { name: data.resellerName, email: data.resellerEmail },
      })

      return tx.resellerContract.create({
        data: {
          resellerId:     reseller.id,
          theaterId:      theater.id,
          commissionRate: data.commissionRate,
          startDate:      new Date(data.startDate),
        },
        include: { reseller: true },
      })
    })

    return NextResponse.json({ data: contract }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
