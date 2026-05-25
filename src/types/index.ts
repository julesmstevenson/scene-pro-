import type {
  Theater, User, TheaterMembership, TheaterRole,
  Show, ShowSession, SessionStatus, SessionPricing,
  Venue, SeatingZone, Seat, SeatStatus,
  Reseller, ResellerContract, ResellerQuota,
  Spectator, LoyaltyAccount, LoyaltyLevel,
  Reservation, ReservationStatus, Ticket, Payment, PaymentStatus,
} from '@prisma/client'

export type {
  Theater, User, TheaterMembership, TheaterRole,
  Show, ShowSession, SessionStatus, SessionPricing,
  Venue, SeatingZone, Seat, SeatStatus,
  Reseller, ResellerContract, ResellerQuota,
  Spectator, LoyaltyAccount, LoyaltyLevel,
  Reservation, ReservationStatus, Ticket, Payment, PaymentStatus,
}

// ─── Extended / joined types ──────────────────────────────────────────────────

export type ShowWithSessions = Show & { sessions: ShowSession[] }

export type ShowSessionWithShow = ShowSession & {
  show: Show & { venue: Venue | null }
  pricings: SessionPricing[]
  _count: { reservations: number }
}

export type ReservationWithDetails = Reservation & {
  tickets: (Ticket & { seat: Seat; pricing: SessionPricing })[]
  spectator: Spectator | null
  session: ShowSession & { show: Show }
  payment: Payment | null
}

export type SpectatorWithLoyalty = Spectator & {
  loyaltyAccount: LoyaltyAccount | null
  _count: { reservations: number }
}

export type SeatMapSeat = {
  id: string
  label: string
  row: string
  number: number
  x: number
  y: number
  status: SeatStatus
  isReserved: boolean
  zone: { id: string; name: string; color: string }
  pricing?: SessionPricing
}

export type SeatMapZone = {
  id: string
  name: string
  color: string
  seats: SeatMapSeat[]
}

// ─── API response wrappers ────────────────────────────────────────────────────

export type ApiSuccess<T> = { data: T; error?: never }
export type ApiError = { error: string; data?: never }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Session / auth augmentation ─────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}
