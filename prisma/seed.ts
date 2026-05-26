import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding…')

  const event = await prisma.event.create({
    data: {
      title:       'La Traviata',
      description: 'Opéra en trois actes de Giuseppe Verdi',
      status:      'PUBLISHED',
      sessions: {
        create: [
          { date: '2026-06-15', time: '19:30' },
          { date: '2026-06-18', time: '19:30' },
          { date: '2026-06-21', time: '15:00' },
        ],
      },
      priceCategories: {
        create: [
          { name: 'Plein tarif', price: 8500 },
          { name: 'Réduit',      price: 5500 },
          { name: 'Étudiant',    price: 3500 },
        ],
      },
    },
  })

  console.log('✅ Done — event:', event.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
