'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/auth-errors'
import { emailSchema } from '@/lib/validation'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    // Validate email
    const emailValidation = emailSchema.safeParse(email)
    if (!emailValidation.success) {
      setError('Invalid email address')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createSupabaseClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (resetError) throw resetError

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          <p className="font-medium">Check your email</p>
          <p className="text-sm mt-1">We&apos;ve sent a password reset link to your email address. Click the link to create a new password.</p>
        </div>

        <Link href="/auth/login" className="block text-center text-amber-600 dark:text-amber-400 hover:underline text-sm">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

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

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2">
        {isLoading && <LoadingSpinner size="sm" />}
        Send Reset Link
      </Button>

      {/* Back to login link */}
      <p className="text-center">
        <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 underline">
          Back to login
        </Link>
      </p>
    </form>
  )
}
