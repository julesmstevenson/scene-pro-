export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json()
    if (body.name !== undefined && !body.name?.trim()) {
      return NextResponse.json({ error: 'Le nom est obligatoire' }, { status: 400 })
    }
    const artist = await prisma.artist.update({
      where: { id: params.id },
      data: {
        ...(body.name     !== undefined && { name:     body.name.trim() }),
        ...(body.bio      !== undefined && { bio:      body.bio?.trim()     || null }),
        ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl        || null }),
        ...(body.email    !== undefined && { email:    body.email?.trim()   || null }),
        ...(body.phone    !== undefined && { phone:    body.phone?.trim()   || null }),
        ...(body.website  !== undefined && { website:  body.website?.trim() || null }),
      },
    })
    return NextResponse.json({ data: artist })
  } catch (err) {
    console.error('[PATCH /api/artists/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.artist.delete({ where: { id: params.id } })
    return NextResponse.json({ data: null }, { status: 200 })
  } catch (err) {
    console.error('[DELETE /api/artists/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
