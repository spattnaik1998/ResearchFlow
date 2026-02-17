import { z } from 'zod'

// Password validation rules
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_UPPERCASE = /[A-Z]/
const PASSWORD_LOWERCASE = /[a-z]/
const PASSWORD_NUMBER = /[0-9]/
const PASSWORD_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .refine((pwd) => PASSWORD_UPPERCASE.test(pwd), 'Password must contain at least one uppercase letter')
  .refine((pwd) => PASSWORD_LOWERCASE.test(pwd), 'Password must contain at least one lowercase letter')
  .refine((pwd) => PASSWORD_NUMBER.test(pwd), 'Password must contain at least one number')
  .refine((pwd) => PASSWORD_SPECIAL.test(pwd), 'Password must contain at least one special character (!@#$%^&*...)')

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Signup form validation
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

// Password reset validation
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// Magic link validation
export const magicLinkSchema = z.object({
  email: emailSchema,
})

export type MagicLinkInput = z.infer<typeof magicLinkSchema>

// Password strength checker (for UI feedback)
export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

export const getPasswordStrength = (password: string): PasswordRequirements => {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: PASSWORD_UPPERCASE.test(password),
    hasLowercase: PASSWORD_LOWERCASE.test(password),
    hasNumber: PASSWORD_NUMBER.test(password),
    hasSpecial: PASSWORD_SPECIAL.test(password),
  }
}

export const calculatePasswordStrength = (requirements: PasswordRequirements): 'weak' | 'medium' | 'strong' => {
  const metCount = Object.values(requirements).filter(Boolean).length
  if (metCount <= 2) return 'weak'
  if (metCount <= 4) return 'medium'
  return 'strong'
}
