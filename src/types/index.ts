import type { Theatre, Event, Ticket, TicketStatus, User } from '@prisma/client'

export type { Theatre, Event, Ticket, TicketStatus, User }

export type EventWithTickets = Event & {
  theatre: Theatre
  tickets: Ticket[]
  _count: { tickets: number }
}

export type ApiSuccess<T> = { data: T; error?: never }
export type ApiError    = { error: string; data?: never }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
