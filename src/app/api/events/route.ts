export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        sessions:        true,
        priceCategories: true,
        castMembers:     true,
        creativeTeam:    true,
      },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ data: events })
  } catch (err) {
    console.error('[GET /api/events]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

type SessionInput        = { date: string; time: string }
type PriceInput          = { name: string; price: number }
type CastMemberInput     = { role: string; name: string }
type CreativeTeamInput   = { role: string; name: string }

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const event = await prisma.event.create({
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
          create: (body.sessions ?? []).map((s: SessionInput) => ({
            date: s.date, time: s.time,
          })),
        },
        priceCategories: {
          create: (body.priceCategories ?? []).map((p: PriceInput) => ({
            name: p.name, price: p.price,
          })),
        },
        castMembers: {
          create: (body.castMembers ?? []).map((c: CastMemberInput) => ({
            role: c.role, name: c.name,
          })),
        },
        creativeTeam: {
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

    return NextResponse.json({ data: event }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/events]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
