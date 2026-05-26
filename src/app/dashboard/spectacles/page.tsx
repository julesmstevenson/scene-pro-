export default function SpectaclesPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Spectacles</h1>
          <p className="text-sm text-gray-400 mt-1">Gérez vos représentations et événements</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)', boxShadow: '0 4px 14px rgba(139,26,26,0.3)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau spectacle
        </button>
      </div>

      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        }
        title="Aucun spectacle pour l'instant"
        description="Créez votre premier spectacle pour commencer à vendre des billets."
      />
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(139,26,26,0.08)', color: '#8B1A1A' }}>
        {icon}
      </div>
      <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs">{description}</p>
    </div>
  )
}
