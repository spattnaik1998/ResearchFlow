import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password - ResearchFlow',
  description: 'Reset your ResearchFlow password',
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reset password</h2>
      <ForgotPasswordForm />
    </div>
  )
}
