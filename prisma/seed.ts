import { PrismaClient, GlobalRole, TheaterRole, SeatStatus, SessionStatus, LoyaltyLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@scenepro.fr' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@scenepro.fr',
      hashedPassword,
      role: GlobalRole.SUPERADMIN,
    },
  })

  const theaterOwner = await prisma.user.upsert({
    where: { email: 'owner@opera-paris.fr' },
    update: {},
    create: {
      name: 'Marie Dupont',
      email: 'owner@opera-paris.fr',
      hashedPassword,
      role: GlobalRole.USER,
    },
  })

  const theater = await prisma.theater.upsert({
    where: { slug: 'opera-paris' },
    update: {},
    create: {
      name: 'Opéra de Paris',
      slug: 'opera-paris',
      description: 'Le grand opéra de la capitale',
      city: 'Paris',
      postalCode: '75009',
      phone: '+33 1 72 29 35 35',
      email: 'contact@opera-paris.fr',
      website: 'https://www.operadeparis.fr',
    },
  })

  await prisma.theaterMembership.upsert({
    where: { userId_theaterId: { userId: theaterOwner.id, theaterId: theater.id } },
    update: {},
    create: { userId: theaterOwner.id, theaterId: theater.id, role: TheaterRole.OWNER },
  })

  const venue = await prisma.venue.create({
    data: {
      theaterId: theater.id,
      name: 'Grande Salle',
      description: 'Salle principale — 1 200 places',
      capacity: 1200,
      layout: { rows: 20, seatsPerRow: 30, hasBalcony: true },
    },
  })

  const orchestraZone = await prisma.seatingZone.create({
    data: { venueId: venue.id, name: 'Orchestre', color: '#6366f1', capacity: 600, sortOrder: 1 },
  })

  const mezzanineZone = await prisma.seatingZone.create({
    data: { venueId: venue.id, name: 'Mezzanine', color: '#8b5cf6', capacity: 350, sortOrder: 2 },
  })

  const balconyZone = await prisma.seatingZone.create({
    data: { venueId: venue.id, name: 'Balcon', color: '#a78bfa', capacity: 250, sortOrder: 3 },
  })

  const rows = ['A', 'B', 'C', 'D', 'E']
  const seatsData: { zoneId: string; row: string; number: number; label: string; x: number; y: number; status: SeatStatus }[] = []

  rows.forEach((row, rowIdx) => {
    for (let num = 1; num <= 20; num++) {
      seatsData.push({
        zoneId: orchestraZone.id,
        row,
        number: num,
        label: `${row}${num}`,
        x: 40 + (num - 1) * 28,
        y: 40 + rowIdx * 28,
        status: SeatStatus.ACTIVE,
      })
    }
  })

  await prisma.seat.createMany({ data: seatsData })

  const show = await prisma.show.create({
    data: {
      theaterId: theater.id,
      venueId: venue.id,
      title: 'La Traviata',
      description: 'Opéra en trois actes de Giuseppe Verdi',
      genre: 'Opéra',
      duration: 165,
      ageRating: 'Tout public',
      isPublished: true,
    },
  })

  const session = await prisma.showSession.create({
    data: {
      showId: show.id,
      startsAt: new Date('2026-06-15T19:30:00'),
      endsAt: new Date('2026-06-15T22:30:00'),
      status: SessionStatus.OPEN,
    },
  })

  await prisma.sessionPricing.createMany({
    data: [
      { sessionId: session.id, zoneId: orchestraZone.id, name: 'Tarif plein',   price: 8500 },
      { sessionId: session.id, zoneId: orchestraZone.id, name: 'Tarif réduit',  price: 5500 },
      { sessionId: session.id, zoneId: mezzanineZone.id, name: 'Tarif plein',   price: 6500 },
      { sessionId: session.id, zoneId: mezzanineZone.id, name: 'Tarif réduit',  price: 4500 },
      { sessionId: session.id, zoneId: balconyZone.id,   name: 'Tarif plein',   price: 4500 },
      { sessionId: session.id, zoneId: balconyZone.id,   name: 'Tarif réduit',  price: 2500 },
    ],
  })

  const reseller = await prisma.reseller.create({
    data: { name: 'Fnac Spectacles', email: 'b2b@fnac.com', phone: '+33 1 55 21 57 93' },
  })

  const contract = await prisma.resellerContract.create({
    data: {
      resellerId: reseller.id,
      theaterId: theater.id,
      commissionRate: 10,
      startDate: new Date('2026-01-01'),
    },
  })

  await prisma.resellerQuota.create({
    data: { contractId: contract.id, sessionId: session.id, allocated: 50, sold: 12 },
  })

  const spectator = await prisma.spectator.create({
    data: {
      theaterId: theater.id,
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@example.com',
      phone: '+33 6 12 34 56 78',
      city: 'Paris',
    },
  })

  await prisma.loyaltyAccount.create({
    data: {
      spectatorId: spectator.id,
      level: LoyaltyLevel.SILVER,
      points: 320,
      totalSpent: 42500,
    },
  })

  console.log('✅ Seed completed')
  console.log('   superadmin : admin@scenepro.fr / password123')
  console.log('   owner      : owner@opera-paris.fr / password123')
  console.log('   tenant     : /opera-paris')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
