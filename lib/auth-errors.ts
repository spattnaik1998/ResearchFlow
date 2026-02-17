/**
 * Client-safe utility for formatting Supabase auth errors
 * This can be used in client components
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password'
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email before logging in'
    }
    if (message.includes('user already registered')) {
      return 'Email already registered. Try logging in instead.'
    }
    if (message.includes('password')) {
      return 'Password does not meet security requirements'
    }

    return error.message
  }

  return 'An unexpected error occurred'
}
