export default function PlanDeSallePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Plan de salle</h1>
        <p className="text-sm text-gray-400 mt-1">Configurez la disposition des places de votre théâtre</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h3 className="font-serif text-lg font-semibold text-gray-800 mb-2">Plan de salle non configuré</h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Définissez les zones, rangées et numéros de places pour activer la réservation par siège.
        </p>
      </div>
    </div>
  )
}
