import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntent } from '@/lib/stripe'
import { ReservationStatus } from '@prisma/client'

type Ctx = { params: { tenant: string } }

export async function GET(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as ReservationStatus | null
  const sessionId = searchParams.get('sessionId')

  const reservations = await prisma.reservation.findMany({
    where: {
      session: { show: { theaterId: theater.id } },
      ...(status ? { status } : {}),
      ...(sessionId ? { sessionId } : {}),
    },
    include: {
      spectator: { select: { id: true, firstName: true, lastName: true, email: true } },
      session:   { include: { show: { select: { id: true, title: true } } } },
      tickets:   { include: { seat: { select: { label: true } }, pricing: { select: { name: true, price: true } } } },
      payment:   { select: { status: true, paidAt: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ data: reservations })
}

const createSchema = z.object({
  sessionId:   z.string().cuid(),
  spectatorId: z.string().cuid().optional(),
  contractId:  z.string().cuid().optional(),
  seats: z.array(z.object({
    seatId:    z.string().cuid(),
    pricingId: z.string().cuid(),
  })).min(1),
  notes: z.string().optional(),
})

export async function POST(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const theater = await prisma.theater.findFirst({
    where: { slug: params.tenant, memberships: { some: { userId: session.user.id } } },
  })
  if (!theater) return NextResponse.json({ error: 'Théâtre introuvable' }, { status: 404 })

  try {
    const { seats, ...resData } = createSchema.parse(await req.json())

    const pricings = await prisma.sessionPricing.findMany({
      where: { id: { in: seats.map((s) => s.pricingId) } },
    })

    const totalAmount = seats.reduce((sum, s) => {
      const p = pricings.find((pr) => pr.id === s.pricingId)
      return sum + (p?.price ?? 0)
    }, 0)

    const contract = resData.contractId
      ? await prisma.resellerContract.findUnique({ where: { id: resData.contractId } })
      : null

    const commissionAmount = contract
      ? Math.round((totalAmount * contract.commissionRate) / 100)
      : undefined

    const reservation = await prisma.$transaction(async (tx) => {
      // Check seats are still available
      const taken = await tx.ticket.findFirst({
        where: {
          seatId: { in: seats.map((s) => s.seatId) },
          reservation: {
            sessionId: resData.sessionId,
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
        },
      })
      if (taken) throw new Error('SEAT_TAKEN')

      const res = await tx.reservation.create({
        data: {
          ...resData,
          totalAmount,
          commissionAmount,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          tickets: {
            create: seats.map((s) => ({ seatId: s.seatId, pricingId: s.pricingId })),
          },
        },
        include: { tickets: true },
      })

      return res
    })

    const paymentIntent = await createPaymentIntent(totalAmount, 'eur', {
      reservationId: reservation.id,
      theaterSlug:   params.tenant,
    })

    await prisma.payment.create({
      data: {
        reservationId:         reservation.id,
        stripePaymentIntentId: paymentIntent.id,
        amount:                totalAmount,
        status:                'PENDING',
      },
    })

    return NextResponse.json(
      { data: { reservation, clientSecret: paymentIntent.client_secret } },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof Error && err.message === 'SEAT_TAKEN') {
      return NextResponse.json({ error: 'Une ou plusieurs places sont déjà réservées' }, { status: 409 })
    }
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error('[POST /api/[tenant]/reservations]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
