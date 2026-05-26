import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding…')

  const user = await prisma.user.upsert({
    where: { email: 'admin@scenepro.fr' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@scenepro.fr',
      hashedPassword: await bcrypt.hash('password123', 12),
    },
  })

  const theatre = await prisma.theatre.upsert({
    where: { slug: 'opera-paris' },
    update: {},
    create: {
      name: 'Opéra de Paris',
      slug: 'opera-paris',
      description: 'Le grand opéra de la capitale',
      city: 'Paris',
    },
  })

  const event = await prisma.event.create({
    data: {
      theatreId: theatre.id,
      title: 'La Traviata',
      description: 'Opéra en trois actes de Giuseppe Verdi',
      date: new Date('2026-06-15T19:30:00'),
      capacity: 500,
    },
  })

  await prisma.ticket.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      eventId: event.id,
      price: 8500,
      reference: `TRV-${String(i + 1).padStart(4, '0')}`,
    })),
  })

  console.log('✅ Done')
  console.log('   login: admin@scenepro.fr / password123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
