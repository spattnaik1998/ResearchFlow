/**
 * Session and cache cleanup utilities for logout and session management
 */

/**
 * Clear all client-side authentication and session data
 * Called during logout to ensure no stale data persists
 */
export function clearClientSession() {
  try {
    // Clear auth-related localStorage keys
    localStorage.removeItem('researchflow_last_user_id')
    localStorage.removeItem('auth-store')

    // Clear all workspace/history localStorage keys
    const allKeys = Object.keys(localStorage)
    for (const key of allKeys) {
      if (key.startsWith('voicesearch_history_')) {
        localStorage.removeItem(key)
      }
    }

    // Clear sessionStorage (temporary session data)
    sessionStorage.clear()

    console.log('[SessionCleanup] Client session cleared')
  } catch (error) {
    console.warn('[SessionCleanup] Error clearing client session:', error)
  }
}

/**
 * Bust browser cache for a specific route
 * Useful when content has changed and needs immediate refresh
 */
export function bustPageCache() {
  try {
    // Clear service worker cache if available
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName)
        })
      })
    }
  } catch (error) {
    console.warn('[SessionCleanup] Error busting cache:', error)
  }
}

/**
 * Perform full session logout on client
 * Clears all auth state, localStorage, sessionStorage
 * Should be paired with server-side /api/auth/logout call
 */
export async function performClientLogout() {
  try {
    clearClientSession()
    bustPageCache()

    // Force page reload to ensure clean state
    // This is more reliable than router.push() as it ensures
    // middleware re-evaluates with cleared session cookies
    setTimeout(() => {
      window.location.href = '/auth/login?logout=true'
    }, 100)
  } catch (error) {
    console.error('[SessionCleanup] Error during client logout:', error)
    // Force redirect anyway
    window.location.href = '/auth/login?error=logout_failed'
  }
}
