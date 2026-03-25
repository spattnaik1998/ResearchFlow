/**
 * Typed BroadcastChannel wrapper for cross-tab authentication synchronization
 * Allows logout in one tab to notify other tabs in real-time.
 *
 * TAB_ID is a unique identifier generated once per tab load. It is attached
 * to every broadcast message so receivers can skip messages from themselves —
 * preventing the self-broadcast race condition where the originating tab
 * would receive its own SIGNED_OUT event and trigger a competing redirect.
 */

// Unique per browser tab; stable for the lifetime of the page
export const TAB_ID =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export interface AuthChannelMessage {
  type: 'SIGNED_OUT' | 'SIGNED_IN' | 'SESSION_REFRESH'
  userId?: string
  timestamp: number
  tabId?: string  // sender identity — receivers skip messages matching their own TAB_ID
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
    // Always attach the sender's TAB_ID so other tabs can filter self-sent messages
    channel.postMessage({ ...message, tabId: TAB_ID })
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
