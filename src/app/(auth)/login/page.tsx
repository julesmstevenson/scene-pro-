'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormData = z.infer<typeof schema>

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email:    data.email,
      password: data.password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError('Email ou mot de passe incorrect')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <>
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-1">Connexion</h1>
      <p className="text-sm text-gray-400 mb-6">Accédez à votre espace</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className={inputClass}
            placeholder="vous@theatre.fr"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Mot de passe
          </label>
          <input
            {...register('password')}
            type="password"
            className={inputClass}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 mt-2"
          style={{
            background: isLoading
              ? '#6B1414'
              : 'linear-gradient(135deg, #8B1A1A 0%, #a61a1a 100%)',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(139,26,26,0.35)',
          }}
        >
          {isLoading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
      </div>

      <p className="text-sm text-gray-400 text-center">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold hover:underline" style={{ color: '#C9A84C' }}>
          Créer un compte
        </Link>
      </p>
    </>
  )
}
