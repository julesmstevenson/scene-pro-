export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { featured } = await req.json()
    const event = await prisma.event.update({
      where: { id: params.id },
      data: { featured: Boolean(featured) },
      select: { id: true, featured: true },
    })
    return NextResponse.json({ data: event })
  } catch (err) {
    console.error('[PATCH /api/events/:id/featured]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
