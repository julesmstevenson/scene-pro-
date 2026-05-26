import type { Event, Session, PriceCategory, EventStatus } from '@prisma/client'

export type { Event, Session, PriceCategory, EventStatus }

export type EventWithDetails = Event & {
  sessions: Session[]
  priceCategories: PriceCategory[]
}

export type ApiSuccess<T> = { data: T; error?: never }
export type ApiError    = { error: string; data?: never }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
