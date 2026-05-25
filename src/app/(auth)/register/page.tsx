'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name:         z.string().min(2, 'Nom requis'),
  email:        z.string().email('Email invalide'),
  password:     z.string().min(8, '8 caractères minimum'),
  theaterName:  z.string().min(2, 'Nom du théâtre requis'),
  theaterSlug:  z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets uniquement'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function handleTheaterNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValue('theaterName', name)
    setValue(
      'theaterSlug',
      name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    )
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null)

    const res = await fetch('/api/theaters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Une erreur est survenue')
      setIsLoading(false)
      return
    }

    router.push(`/login?registered=1`)
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer votre espace</h1>
      <p className="text-sm text-gray-500 mb-6">Configurez votre théâtre en 2 minutes</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Marie Dupont"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="vous@theatre.fr"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            {...register('password')}
            type="password"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du théâtre</label>
          <input
            {...register('theaterName')}
            onChange={handleTheaterNameChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Opéra de Lyon"
          />
          {errors.theaterName && <p className="text-xs text-red-500 mt-1">{errors.theaterName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant URL</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
            <span className="bg-gray-50 text-gray-400 text-sm px-3 py-2 border-r border-gray-200">scenepro.fr/</span>
            <input
              {...register('theaterSlug')}
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
              placeholder="opera-de-lyon"
            />
          </div>
          {errors.theaterSlug && <p className="text-xs text-red-500 mt-1">{errors.theaterSlug.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {isLoading ? 'Création…' : 'Créer mon espace théâtre'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  )
}
