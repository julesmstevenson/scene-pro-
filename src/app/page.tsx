import Link from 'next/link'
import { Ticket, BarChart3, Users, Network, CreditCard, Map } from 'lucide-react'

const features = [
  { icon: Map,        title: 'Plan de salle interactif',    desc: 'Réservation de places en temps réel avec visualisation SVG' },
  { icon: Users,      title: 'CRM spectateurs',             desc: 'Profils, fidélité Bronze → Platine, historique complet' },
  { icon: Network,    title: 'Réseau de revendeurs',        desc: 'Quotas par séance, commissions automatiques, suivi des ventes' },
  { icon: BarChart3,  title: 'Tableaux de bord',            desc: 'KPIs en temps réel : remplissage, revenus, tendances' },
  { icon: CreditCard, title: 'Paiements Stripe',            desc: 'Checkout sécurisé, remboursements, Stripe Connect multi-tenant' },
  { icon: Ticket,     title: 'Multi-tenant',                desc: 'Chaque théâtre dispose de son espace totalement isolé' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-brand-600" />
          <span className="text-xl font-bold text-gray-900">Scène Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          Plateforme SaaS de billetterie
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          La billetterie professionnelle<br />
          <span className="text-brand-600">pour les théâtres modernes</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Gérez vos spectacles, séances et réservations depuis une seule plateforme.
          Plan de salle interactif, réseau de revendeurs et CRM intégrés.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-brand-600 text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Démarrer gratuitement
          </Link>
          <Link
            href="/login"
            className="text-gray-700 px-8 py-3 rounded-xl text-base font-semibold border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Voir la démo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Scène Pro — Tous droits réservés
      </footer>
    </div>
  )
}
