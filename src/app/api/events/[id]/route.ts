export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SessionInput      = { date: string; time: string }
type PriceInput        = { name: string; price: number }
type CastMemberInput   = { role: string; name: string }
type CreativeTeamInput = { role: string; name: string }

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
        author:      body.author      ?? null,
        director:    body.director    ?? null,
        duration:    body.duration    ?? null,
        genre:       body.genre       ?? null,
        status:      body.status      ?? 'DRAFT',
        sessions: {
          deleteMany: {},
          create: (body.sessions ?? []).map((s: SessionInput) => ({
            date: s.date, time: s.time,
          })),
        },
        priceCategories: {
          deleteMany: {},
          create: (body.priceCategories ?? []).map((p: PriceInput) => ({
            name: p.name, price: p.price,
          })),
        },
        castMembers: {
          deleteMany: {},
          create: (body.castMembers ?? []).map((c: CastMemberInput) => ({
            role: c.role, name: c.name,
          })),
        },
        creativeTeam: {
          deleteMany: {},
          create: (body.creativeTeam ?? []).map((c: CreativeTeamInput) => ({
            role: c.role, name: c.name,
          })),
        },
      },
      include: {
        sessions:        true,
        priceCategories: true,
        castMembers:     true,
        creativeTeam:    true,
      },
    })

    return NextResponse.json({ data: event })
  } catch (err) {
    console.error('[PATCH /api/events/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
