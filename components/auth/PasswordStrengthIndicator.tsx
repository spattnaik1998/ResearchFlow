'use client'

import { getPasswordStrength, calculatePasswordStrength } from '@/lib/validation'
import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  showChecklist?: boolean
}

export function PasswordStrengthIndicator({
  password,
  showChecklist = true,
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null
  }

  const requirements = getPasswordStrength(password)
  const strength = calculatePasswordStrength(requirements)

  const strengthConfig = {
    weak: {
      color: 'bg-red-500',
      text: 'Weak',
      textColor: 'text-red-600 dark:text-red-400',
    },
    medium: {
      color: 'bg-yellow-500',
      text: 'Medium',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    strong: {
      color: 'bg-green-500',
      text: 'Strong',
      textColor: 'text-green-600 dark:text-green-400',
    },
  }

  const config = strengthConfig[strength]
  const metCount = Object.values(requirements).filter(Boolean).length

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.color} transition-all duration-300`}
            style={{ width: `${(metCount / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium min-w-12 ${config.textColor}`}>{config.text}</span>
      </div>

      {/* Requirements checklist */}
      {showChecklist && (
        <ul className="text-sm space-y-1">
          <li className="flex items-center gap-2">
            {requirements.minLength ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
            <span className={requirements.minLength ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
              At least 8 characters
            </span>
          </li>

          <li className="flex items-center gap-2">
            {requirements.hasUppercase ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
            <span className={requirements.hasUppercase ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
              One uppercase letter (A-Z)
            </span>
          </li>

          <li className="flex items-center gap-2">
            {requirements.hasLowercase ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
            <span className={requirements.hasLowercase ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
              One lowercase letter (a-z)
            </span>
          </li>

          <li className="flex items-center gap-2">
            {requirements.hasNumber ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
            <span className={requirements.hasNumber ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
              One number (0-9)
            </span>
          </li>

          <li className="flex items-center gap-2">
            {requirements.hasSpecial ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
            <span className={requirements.hasSpecial ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
              One special character (!@#$%^&*...)
            </span>
          </li>
        </ul>
      )}
    </div>
  )
}
