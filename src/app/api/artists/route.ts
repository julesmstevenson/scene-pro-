export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const artists = await prisma.artist.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: artists })
  } catch (err) {
    console.error('[GET /api/artists]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Le nom est obligatoire' }, { status: 400 })
    }
    const artist = await prisma.artist.create({
      data: {
        name:     body.name.trim(),
        bio:      body.bio?.trim()      || null,
        photoUrl: body.photoUrl         || null,
        email:    body.email?.trim()    || null,
        phone:    body.phone?.trim()    || null,
        website:  body.website?.trim()  || null,
      },
    })
    return NextResponse.json({ data: artist }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/artists]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
