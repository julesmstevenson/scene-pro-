export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        customer: true,
        event: { select: { id: true, title: true } },
        session: true,
        lines: { include: { priceCategory: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: bookings })
  } catch (err) {
    console.error('[GET /api/bookings]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

type LineInput = { priceCategoryId: string; quantity: number; unitPrice: number }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      eventId,
      sessionId,
      lines,
    } = body as {
      customerEmail: string
      customerFirstName?: string
      customerLastName?: string
      customerPhone?: string
      eventId: string
      sessionId?: string
      lines: LineInput[]
    }

    if (!customerEmail || !eventId || !lines?.length) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const customer = await prisma.customer.upsert({
      where: { email: customerEmail },
      update: {},
      create: {
        email: customerEmail,
        firstName: customerFirstName ?? null,
        lastName: customerLastName ?? null,
        phone: customerPhone ?? null,
      },
    })

    const totalAmount = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        eventId,
        sessionId: sessionId ?? null,
        totalAmount,
        lines: {
          create: lines.map(l => ({
            priceCategoryId: l.priceCategoryId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        },
      },
      include: { customer: true, lines: true },
    })

    return NextResponse.json({ data: booking }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/bookings]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
