export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [bookings, events] = await Promise.all([
      prisma.booking.findMany({
        where: { status: 'CONFIRMED' },
        include: { lines: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.event.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          bookings: {
            where: { status: 'CONFIRMED' },
            include: { lines: true },
          },
          sessions: true,
          priceCategories: true,
        },
      }),
    ])

    const totalCA = bookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const totalBookings = bookings.length
    const avgBasket = totalBookings ? Math.round(totalCA / totalBookings) : 0

    const customerCounts = bookings.reduce((acc, b) => {
      acc[b.customerId] = (acc[b.customerId] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
    const totalCustomers = Object.keys(customerCounts).length
    const recurringCustomers = Object.values(customerCounts).filter(n => n > 1).length

    const now = new Date()
    const caByMonth = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('fr-FR', { month: 'short' })
      const monthCA = bookings
        .filter(b => b.createdAt.toISOString().startsWith(monthKey))
        .reduce((sum, b) => sum + b.totalAmount, 0)
      return { month: label, ca: monthCA }
    })

    const eventStats = events.map(e => {
      const eventCA = e.bookings.reduce((sum, b) => sum + b.totalAmount, 0)
      const ticketsSold = e.bookings.reduce(
        (sum, b) => sum + b.lines.reduce((ls, l) => ls + l.quantity, 0),
        0,
      )
      const eventAvgBasket = e.bookings.length
        ? Math.round(eventCA / e.bookings.length)
        : 0
      return {
        id: e.id,
        title: e.title,
        status: e.status,
        featured: e.featured,
        imageUrl: e.imageUrl,
        bookingsCount: e.bookings.length,
        ca: eventCA,
        ticketsSold,
        avgBasket: eventAvgBasket,
      }
    })

    return NextResponse.json({
      data: {
        totalCA,
        totalBookings,
        avgBasket,
        recurringCustomers,
        totalCustomers,
        caByMonth,
        eventStats,
      },
    })
  } catch (err) {
    console.error('[GET /api/ventes/stats]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
