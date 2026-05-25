import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { isValidSlug, RESERVED_SLUGS } from '@/lib/utils'
import { TheaterRole } from '@prisma/client'

const createSchema = z.object({
  name:        z.string().min(2),
  email:       z.string().email(),
  password:    z.string().min(8),
  theaterName: z.string().min(2),
  theaterSlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    if (!isValidSlug(data.theaterSlug)) {
      return NextResponse.json({ error: 'Identifiant URL réservé ou invalide' }, { status: 400 })
    }

    const [existingUser, existingSlug] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.theater.findUnique({ where: { slug: data.theaterSlug } }),
    ])

    if (existingUser) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    if (existingSlug) return NextResponse.json({ error: 'Identifiant URL déjà pris' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email: data.email, hashedPassword },
      })

      const theater = await tx.theater.create({
        data: { name: data.theaterName, slug: data.theaterSlug, email: data.email },
      })

      await tx.theaterMembership.create({
        data: { userId: user.id, theaterId: theater.id, role: TheaterRole.OWNER },
      })

      return { user, theater }
    })

    return NextResponse.json(
      { data: { theaterId: result.theater.id, slug: result.theater.slug } },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[POST /api/theaters]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
