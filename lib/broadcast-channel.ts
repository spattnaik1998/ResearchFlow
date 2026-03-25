/**
 * Typed BroadcastChannel wrapper for cross-tab authentication synchronization
 * Allows logout in one tab to notify other tabs in real-time
 */

export interface AuthChannelMessage {
  type: 'SIGNED_OUT' | 'SIGNED_IN' | 'SESSION_REFRESH'
  userId?: string
  timestamp: number
}

export function createAuthChannel(): BroadcastChannel | null {
  // Guard against SSR (window is undefined on server)
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return new BroadcastChannel('researchflow_auth')
  } catch (error) {
    // BroadcastChannel not supported (rare, but handle gracefully)
    console.warn('BroadcastChannel not supported:', error)
    return null
  }
}

export function broadcastAuthEvent(channel: BroadcastChannel | null, message: AuthChannelMessage) {
  if (!channel) return

  try {
    channel.postMessage(message)
  } catch (error) {
    console.error('Failed to broadcast auth event:', error)
  }
}

export function listenToAuthEvents(
  channel: BroadcastChannel | null,
  onMessage: (message: AuthChannelMessage) => void
) {
  if (!channel) return () => {}

  const handleMessage = (event: MessageEvent<AuthChannelMessage>) => {
    onMessage(event.data)
  }

  channel.addEventListener('message', handleMessage)

  // Return unsubscribe function
  return () => {
    channel.removeEventListener('message', handleMessage)
  }
}
