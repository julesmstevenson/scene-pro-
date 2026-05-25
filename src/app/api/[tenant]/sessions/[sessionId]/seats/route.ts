import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { tenant: string; sessionId: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const showSession = await prisma.showSession.findFirst({
    where: {
      id: params.sessionId,
      show: { theater: { slug: params.tenant } },
    },
    include: {
      pricings: { include: { zone: true } },
      reservations: {
        where: { status: { in: ['CONFIRMED', 'PENDING'] } },
        include: { tickets: { select: { seatId: true } } },
      },
    },
  })

  if (!showSession) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

  const reservedSeatIds = new Set(
    showSession.reservations.flatMap((r) => r.tickets.map((t) => t.seatId))
  )

  const venue = await prisma.venue.findFirst({
    where: { shows: { some: { sessions: { some: { id: params.sessionId } } } } },
    include: {
      zones: {
        include: { seats: { where: { status: 'ACTIVE' } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!venue) return NextResponse.json({ error: 'Salle introuvable' }, { status: 404 })

  const pricingByZone = new Map(showSession.pricings.map((p) => [p.zoneId, p]))

  const seatMap = venue.zones.map((zone) => ({
    id:       zone.id,
    name:     zone.name,
    color:    zone.color,
    pricing:  pricingByZone.get(zone.id) ?? null,
    seats: zone.seats.map((seat) => ({
      id:         seat.id,
      label:      seat.label,
      row:        seat.row,
      number:     seat.number,
      x:          seat.x,
      y:          seat.y,
      isReserved: reservedSeatIds.has(seat.id),
    })),
  }))

  return NextResponse.json({ data: seatMap })
}
