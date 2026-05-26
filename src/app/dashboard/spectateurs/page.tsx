export default function SpectatteursPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Spectateurs</h1>
        <p className="text-sm text-gray-400 mt-1">Base de données de vos acheteurs et abonnés</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(139,26,26,0.08)', color: '#8B1A1A' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2">Aucun spectateur enregistré</h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Les spectateurs apparaîtront ici dès qu'un premier billet sera vendu.
        </p>
      </div>
    </div>
  )
}
