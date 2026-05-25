import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type Props = { title: string; subtitle?: string }

export async function Header({ title, subtitle }: Props) {
  const session = await getServerSession(authOptions)

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{session?.user.name}</p>
          <p className="text-xs text-gray-400">{session?.user.email}</p>
        </div>
        <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-brand-700">
            {session?.user.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
      </div>
    </header>
  )
}
