export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: { sessions: true, priceCategories: true },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ data: events })
  } catch (err) {
    console.error('[GET /api/events]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const event = await prisma.event.create({
      data: {
        title:       body.title       ?? '',
        description: body.description ?? null,
        imageUrl:    body.imageUrl    ?? null,
        status:      body.status      ?? 'DRAFT',
        sessions: {
          create: (body.sessions ?? []).map((s: { date: string; time: string }) => ({
            date: s.date,
            time: s.time,
          })),
        },
        priceCategories: {
          create: (body.priceCategories ?? []).map((p: { name: string; price: number }) => ({
            name:  p.name,
            price: p.price,
          })),
        },
      },
      include: { sessions: true, priceCategories: true },
    })

    return NextResponse.json({ data: event }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/events]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
