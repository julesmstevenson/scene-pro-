export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim()

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: customers })
  } catch (err) {
    console.error('[GET /api/customers]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
