'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

type Seat = {
  id:         string
  label:      string
  row:        string
  number:     number
  x:          number | null
  y:          number | null
  isReserved: boolean
}

type Zone = {
  id:      string
  name:    string
  color:   string
  pricing: { name: string; price: number } | null
  seats:   Seat[]
}

type Props = {
  zones:        Zone[]
  onSelect?:    (selected: { seatId: string; pricingId: string; zoneId: string }[]) => void
  maxSelection?: number
}

function getSeatStatus(seat: Seat, selectedIds: Set<string>): 'available' | 'reserved' | 'selected' {
  if (seat.isReserved)       return 'reserved'
  if (selectedIds.has(seat.id)) return 'selected'
  return 'available'
}

const STATUS_COLORS = {
  available: { fill: '#e0e7ff', stroke: '#6366f1', hover: '#c7d2fe' },
  reserved:  { fill: '#fee2e2', stroke: '#ef4444', hover: '#fee2e2' },
  selected:  { fill: '#6366f1', stroke: '#4f46e5', hover: '#4f46e5' },
}

const SEAT_R   = 10
const SEAT_GAP = 24

export function SeatMap({ zones, onSelect, maxSelection = 10 }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId]     = useState<string | null>(null)

  // Build a flat list of seats with grid positions when x/y not provided
  const layoutZones = zones.map((zone, zi) => {
    const rows    = [...new Set(zone.seats.map((s) => s.row))].sort()
    const rowMap  = Object.fromEntries(rows.map((r, i) => [r, i]))
    const baseY   = zi * (rows.length * SEAT_GAP + 60) + 30

    return {
      ...zone,
      baseY,
      rowCount: rows.length,
      seats: zone.seats.map((seat) => ({
        ...seat,
        cx: seat.x ?? (seat.number - 1) * SEAT_GAP + SEAT_GAP,
        cy: seat.y ?? baseY + rowMap[seat.row] * SEAT_GAP,
      })),
    }
  })

  const totalHeight = layoutZones.reduce((h, z) => Math.max(h, z.baseY + z.rowCount * SEAT_GAP + 40), 200)
  const maxSeatsPerRow = Math.max(...zones.flatMap((z) => z.seats.map((s) => s.number)))
  const svgWidth = maxSeatsPerRow * SEAT_GAP + SEAT_GAP * 2

  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.isReserved) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(seat.id)) {
        next.delete(seat.id)
      } else {
        if (next.size >= maxSelection) return prev
        next.add(seat.id)
      }
      return next
    })
  }, [maxSelection])

  // Notify parent on change
  const handleConfirm = () => {
    if (!onSelect) return
    const selected = layoutZones.flatMap((zone) =>
      zone.seats
        .filter((s) => selectedIds.has(s.id) && zone.pricing)
        .map((s) => ({ seatId: s.id, pricingId: zone.pricing!.name, zoneId: zone.id }))
    )
    onSelect(selected)
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap text-sm">
        {[
          { status: 'available', label: 'Disponible' },
          { status: 'selected',  label: 'Sélectionné' },
          { status: 'reserved',  label: 'Réservé'     },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{
                backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS].fill,
                borderColor:     STATUS_COLORS[status as keyof typeof STATUS_COLORS].stroke,
              }}
            />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Zone color legend */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        {zones.map((zone) => (
          <div key={zone.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: zone.color }} />
            <span className="text-gray-600">{zone.name}</span>
            {zone.pricing && (
              <span className="text-gray-400">— à partir de {(zone.pricing.price / 100).toFixed(2)} €</span>
            )}
          </div>
        ))}
      </div>

      {/* SVG map */}
      <div className="border border-gray-200 rounded-2xl overflow-auto bg-gray-50 p-4">
        {/* Stage */}
        <div className="text-center mb-4">
          <div className="inline-block bg-gray-200 text-gray-500 text-xs font-medium px-12 py-2 rounded-lg">
            SCÈNE
          </div>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${totalHeight}`}
          className="w-full"
          style={{ maxHeight: 500 }}
        >
          {layoutZones.map((zone) => (
            <g key={zone.id}>
              {/* Zone label */}
              <text
                x={svgWidth / 2}
                y={zone.baseY - 8}
                textAnchor="middle"
                fontSize={11}
                fill="#9ca3af"
                fontWeight={500}
              >
                {zone.name}
              </text>

              {zone.seats.map((seat) => {
                const status  = getSeatStatus(seat, selectedIds)
                const colors  = STATUS_COLORS[status]
                const isHover = hoveredId === seat.id

                return (
                  <g key={seat.id}>
                    <circle
                      cx={seat.cx}
                      cy={seat.cy}
                      r={SEAT_R}
                      fill={isHover && status !== 'reserved' ? colors.hover : colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={1.5}
                      style={{ cursor: seat.isReserved ? 'not-allowed' : 'pointer', transition: 'fill 0.1s' }}
                      onClick={() => handleSeatClick(seat)}
                      onMouseEnter={() => setHoveredId(seat.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                    <text
                      x={seat.cx}
                      y={seat.cy + 4}
                      textAnchor="middle"
                      fontSize={7}
                      fill={status === 'selected' ? '#fff' : '#374151'}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {seat.label}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Selection summary */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
          <span className="text-sm text-brand-700 font-medium">
            {selectedIds.size} place{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
            >
              Effacer
            </button>
            {onSelect && (
              <button
                onClick={handleConfirm}
                className="text-sm bg-brand-600 text-white px-4 py-1.5 rounded-lg hover:bg-brand-700 transition-colors font-medium"
              >
                Réserver →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
