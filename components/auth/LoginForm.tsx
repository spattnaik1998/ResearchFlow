'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/auth-errors'
import { loginSchema } from '@/lib/validation'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    // Guard against missing Supabase configuration
    if (!isSupabaseConfigured) {
      setError('Authentication is not configured yet. Please try again in a few minutes.')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createSupabaseClient()

      if (useMagicLink) {
        // Magic link sign in
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (magicError) throw magicError

        setSuccess('Check your email for the login link!')
        setEmail('')
      } else {
        // Email/password sign in
        const { error: signInError } = loginSchema.safeParse({ email, password }).success
          ? await supabase.auth.signInWithPassword({
              email,
              password,
            })
          : { error: { message: 'Invalid email or password format' } }

        if (signInError) throw signInError

        // Redirect to app
        router.push('/app')
      }
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          disabled={isLoading}
        />
      </div>

      {/* Password (hidden if using magic link) */}
      {!useMagicLink && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Toggle Magic Link */}
      <button
        type="button"
        onClick={() => {
          setUseMagicLink(!useMagicLink)
          setPassword('')
          setError(null)
        }}
        disabled={isLoading}
        className="text-sm text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
      >
        {useMagicLink ? 'Use password instead' : 'Send magic link'}
      </button>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoading && <LoadingSpinner size="sm" />}
        {useMagicLink ? 'Send Login Link' : 'Sign In'}
      </Button>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
          Sign up
        </Link>
      </p>

      {/* Forgot password link */}
      {!useMagicLink && (
        <p className="text-center">
          <Link href="/auth/forgot-password" className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 underline">
            Forgot password?
          </Link>
        </p>
      )}
    </form>
  )
}
