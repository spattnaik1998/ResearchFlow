import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In - ResearchFlow',
  description: 'Sign in to your ResearchFlow account',
}

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome back</h2>
      <LoginForm />
    </div>
  )
}
