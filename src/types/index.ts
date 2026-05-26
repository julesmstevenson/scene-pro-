import type {
  Event,
  Session,
  PriceCategory,
  EventStatus,
  CastMember,
  CreativeTeamMember,
  Artist,
} from '@prisma/client'

export type { Event, Session, PriceCategory, EventStatus, CastMember, CreativeTeamMember, Artist }

export type EventWithDetails = Event & {
  sessions:        Session[]
  priceCategories: PriceCategory[]
  castMembers:     CastMember[]
  creativeTeam:    CreativeTeamMember[]
}

export type ApiSuccess<T> = { data: T; error?: never }
export type ApiError    = { error: string; data?: never }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
