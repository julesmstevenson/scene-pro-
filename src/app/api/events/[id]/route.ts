export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json()

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title:       body.title       ?? '',
        description: body.description ?? null,
        imageUrl:    body.imageUrl    ?? null,
        status:      body.status      ?? 'DRAFT',
        // Remplace les séances et tarifs existants
        sessions: {
          deleteMany: {},
          create: (body.sessions ?? []).map((s: { date: string; time: string }) => ({
            date: s.date,
            time: s.time,
          })),
        },
        priceCategories: {
          deleteMany: {},
          create: (body.priceCategories ?? []).map((p: { name: string; price: number }) => ({
            name:  p.name,
            price: p.price,
          })),
        },
      },
      include: { sessions: true, priceCategories: true },
    })

    return NextResponse.json({ data: event })
  } catch (err) {
    console.error('[PATCH /api/events/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
