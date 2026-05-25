import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'

type Props = { children: React.ReactNode; params: { tenant: string } }

export default async function TenantLayout({ children, params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const theater = await prisma.theater.findFirst({
    where: {
      slug: params.tenant,
      memberships: { some: { userId: session.user.id } },
    },
  })

  if (!theater) notFound()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar tenant={params.tenant} theaterName={theater.name} />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
