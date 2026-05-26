export default function PaiementsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-sm text-gray-400 mt-1">Suivi des transactions et reversements</p>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Revenus du mois', value: '—', sub: 'En attente de données' },
          { label: 'Billets vendus', value: '—', sub: 'En attente de données' },
          { label: 'Taux de remplissage', value: '—', sub: 'En attente de données' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
            <p className="font-serif text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-300 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>
        <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2">Aucune transaction</h3>
        <p className="text-sm text-gray-400 max-w-xs">
          L'historique des paiements s'affichera ici une fois les premières ventes enregistrées.
        </p>
      </div>
    </div>
  )
}
