'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { LogOut, Settings, User } from 'lucide-react'

export function UserMenu() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  async function handleLogout() {
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      logout()
      setIsOpen(false)
      router.push('/auth/login')
    }
  }

  const avatar = user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase() || '?'

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-sm hover:shadow-lg transition flex items-center justify-center"
        title={user.email}
        aria-label="Open user menu"
        aria-expanded={isOpen}
      >
        {avatar}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || 'User'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <nav className="py-2">
            <Link
              href="/app/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>

            <Link
              href="/app/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            {/* Divider */}
            <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
