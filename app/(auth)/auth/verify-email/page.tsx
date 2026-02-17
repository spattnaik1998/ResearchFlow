'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex gap-4">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We&apos;ve sent a confirmation link to{' '}
              <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click the link in the email to verify your account and get started with ResearchFlow.
            </p>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>⏱️ Link expires in 24 hours</p>
              <p>💌 Check your spam folder if you don&apos;t see the email</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already verified?
        </p>
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition"
        >
          Go to login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Need help?{' '}
          <Link href="/support" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
