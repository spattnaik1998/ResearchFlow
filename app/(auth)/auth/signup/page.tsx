import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Create Account - ResearchFlow',
  description: 'Sign up for a new ResearchFlow account',
}

export default function SignupPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create your account</h2>
      <SignupForm />
    </div>
  )
}
