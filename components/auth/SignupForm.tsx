'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/auth-helpers'
import { signupSchema } from '@/lib/validation'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    setIsLoading(true)

    // Validate with Zod
    const validation = signupSchema.safeParse({
      email,
      password,
      confirmPassword,
    })

    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.flatten((err) => err.message).fieldErrors
      Object.entries(validation.error.flatten().fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          errors[field] = messages[0]
        }
      })
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createSupabaseClient()

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      // Redirect to verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
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
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition ${
            validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {validationErrors.email && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{validationErrors.email}</p>
        )}
      </div>

      {/* Password */}
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
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition ${
            validationErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {validationErrors.password && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{validationErrors.password}</p>
        )}

        {/* Password strength indicator */}
        {password && <div className="mt-3"><PasswordStrengthIndicator password={password} /></div>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition ${
            validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {validationErrors.confirmPassword && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p>
        )}
      </div>

      {/* Terms checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          disabled={isLoading}
          className="rounded"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          I agree to the{' '}
          <Link href="/terms" className="text-amber-600 dark:text-amber-400 hover:underline">
            terms and conditions
          </Link>
        </span>
      </label>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading || !agreedToTerms}
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoading && <LoadingSpinner size="sm" />}
        Create Account
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  )
}
