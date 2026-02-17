'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { getAuthErrorMessage } from '@/lib/auth-helpers'
import { resetPasswordSchema } from '@/lib/validation'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    setIsLoading(true)

    // Validate passwords
    const validation = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    })

    if (!validation.success) {
      const errors: Record<string, string> = {}
      Object.entries(validation.error.flatten().fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          errors[field] = messages[0]
        }
      })
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const supabase = createSupabaseClient()

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) throw updateError

      // Redirect to login
      router.push('/auth/login?message=Password+updated+successfully')
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      if (errorMessage.includes('session_not_found') || errorMessage.includes('invalid')) {
        setError('Reset link has expired. Please request a new one.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below. Make sure it&apos;s strong and unique.
        </p>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password
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

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2">
        {isLoading && <LoadingSpinner size="sm" />}
        Reset Password
      </Button>
    </form>
  )
}
