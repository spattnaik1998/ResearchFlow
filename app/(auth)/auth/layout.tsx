import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">ResearchFlow</h1>
          <p className="text-gray-600 dark:text-gray-400">AI-powered research assistant</p>
        </div>

        {/* Auth form */}
        {children}

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  )
}
