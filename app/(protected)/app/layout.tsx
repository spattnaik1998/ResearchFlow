import { ReactNode } from 'react'
import { UserMenu } from '@/components/UserMenu'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top navigation bar */}
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 bg-white dark:bg-gray-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text">
              ResearchFlow
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
