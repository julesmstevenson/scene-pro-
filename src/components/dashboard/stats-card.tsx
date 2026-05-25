import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title:   string
  value:   string | number
  sub?:    string
  icon:    LucideIcon
  trend?:  { value: number; label: string }
  color?:  'brand' | 'green' | 'amber' | 'red'
}

const colorMap = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red:   'bg-red-50 text-red-600',
}

export function StatsCard({ title, value, sub, icon: Icon, trend, color = 'brand' }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend.value >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
