import type {
  Event,
  Session,
  PriceCategory,
  EventStatus,
  CastMember,
  CreativeTeamMember,
  Artist,
  Customer,
  Booking,
  BookingLine,
  BookingStatus,
} from '@prisma/client'

export type {
  Event, Session, PriceCategory, EventStatus,
  CastMember, CreativeTeamMember, Artist,
  Customer, Booking, BookingLine, BookingStatus,
}

export type EventWithDetails = Event & {
  sessions:        Session[]
  priceCategories: PriceCategory[]
  castMembers:     CastMember[]
  creativeTeam:    CreativeTeamMember[]
}

export type BookingWithDetails = Booking & {
  customer: Customer
  event:    { id: string; title: string }
  session:  Session | null
  lines:    (BookingLine & { priceCategory: PriceCategory })[]
}

export type ApiSuccess<T> = { data: T; error?: never }
export type ApiError    = { error: string; data?: never }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
