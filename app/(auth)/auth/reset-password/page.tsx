import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password - ResearchFlow',
  description: 'Create a new password for your ResearchFlow account',
}

export default function ResetPasswordPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create new password</h2>
      <ResetPasswordForm />
    </div>
  )
}
