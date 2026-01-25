/**
 * Analytics Tracking Module
 * 
 * Tracks Media Manager events for future backend integration.
 * Currently stores events in memory and localStorage for development.
 * When backend is ready, events will be sent to analytics API.
 * 
 * Usage:
 * ```typescript
 * import { trackEvent } from '@/lib/analytics'
 * 
 * trackEvent('media_manager_opened', {
 *   creationMethod: 'ai-generated',
 *   taskId: 'task-123'
 * })
 * ```
 */

export type AnalyticsEventName =
  | 'media_manager_opened'
  | 'media_manager_closed'
  | 'asset_linked_from_library'
  | 'asset_uploaded_new'
  | 'asset_clearance_checked'
  | 'prompt_suggestion_viewed'
  | 'prompt_suggestion_used'
  | 'prompt_created_new'
  | 'prompt_saved_to_library'
  | 'training_data_linked'
  | 'reference_added'
  | 'creator_assigned'
  | 'creator_removed'
  | 'clearance_check_completed'
  | 'media_validation_warning'
  | 'media_validation_error'
  | 'media_saved'
  | 'task_submitted_with_media'
  | 'tab_switched'
  | 'keyboard_shortcut_used'

export interface AnalyticsEvent {
  name: AnalyticsEventName
  timestamp: string
  data?: Record<string, any>
  userId?: string
  sessionId?: string
}

// In-memory storage for development
if (typeof window !== 'undefined') {
  ;(window as any).__mediaAnalytics = (window as any).__mediaAnalytics || []
}

/**
 * Track an analytics event
 * 
 * @param name - Event name
 * @param data - Optional event data/properties
 * @param userId - Optional user ID
 */
export function trackEvent(
  name: AnalyticsEventName,
  data?: Record<string, any>,
  userId?: string
): void {
  if (typeof window === 'undefined') return

  const event: AnalyticsEvent = {
    name,
    timestamp: new Date().toISOString(),
    data,
    userId: userId || getCurrentUserId(),
    sessionId: getSessionId()
  }

  // Store in memory
  ;(window as any).__mediaAnalytics.push(event)

  // Store in localStorage (keep last 100 events)
  try {
    const storageKey = 'media-analytics-events'
    const stored = localStorage.getItem(storageKey)
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : []
    
    events.push(event)
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.shift()
    }
    
    localStorage.setItem(storageKey, JSON.stringify(events))
  } catch (e) {
    console.error('Failed to store analytics event:', e)
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', name, data)
  }

  // TODO: Send to backend when ready
  // sendToBackend(event)
}

/**
 * Get current user ID from session/auth
 * (Placeholder - integrate with your auth system)
 */
function getCurrentUserId(): string | undefined {
  // TODO: Get from auth context
  return 'user-demo'
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'session-unknown'

  let sessionId = sessionStorage.getItem('analytics-session-id')
  
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('analytics-session-id', sessionId)
  }
  
  return sessionId
}

/**
 * Get all tracked events
 */
export function getAnalyticsEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem('media-analytics-events')
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to get analytics events:', e)
    return []
  }
}

/**
 * Clear analytics events
 */
export function clearAnalyticsEvents(): void {
  if (typeof window === 'undefined') return
  
  ;(window as any).__mediaAnalytics = []
  localStorage.removeItem('media-analytics-events')
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(): {
  totalEvents: number
  eventCounts: Record<string, number>
  lastEvent?: AnalyticsEvent
} {
  const events = getAnalyticsEvents()
  
  const eventCounts: Record<string, number> = {}
  events.forEach(event => {
    eventCounts[event.name] = (eventCounts[event.name] || 0) + 1
  })
  
  return {
    totalEvents: events.length,
    eventCounts,
    lastEvent: events[events.length - 1]
  }
}

/**
 * Track Media Manager lifecycle
 */
export const mediaManagerAnalytics = {
  opened: (creationMethod: string, taskId?: string) => {
    trackEvent('media_manager_opened', { creationMethod, taskId })
  },
  
  closed: (duration: number, saved: boolean) => {
    trackEvent('media_manager_closed', { duration, saved })
  },
  
  tabSwitched: (from: string, to: string) => {
    trackEvent('tab_switched', { from, to })
  },
  
  assetLinked: (assetId: string, source: 'library' | 'upload') => {
    trackEvent('asset_linked_from_library', { assetId, source })
  },
  
  assetUploaded: (fileType: string, fileSize: number) => {
    trackEvent('asset_uploaded_new', { fileType, fileSize })
  },
  
  promptUsed: (promptId: string, source: 'suggestion' | 'manual') => {
    if (source === 'suggestion') {
      trackEvent('prompt_suggestion_used', { promptId })
    } else {
      trackEvent('prompt_created_new', {})
    }
  },
  
  promptSaved: (title: string, isPrivate: boolean) => {
    trackEvent('prompt_saved_to_library', { title, isPrivate })
  },
  
  creatorAssigned: (creatorId: string, authStatus: string) => {
    trackEvent('creator_assigned', { creatorId, authStatus })
  },
  
  validationWarning: (warnings: string[]) => {
    trackEvent('media_validation_warning', { warnings, count: warnings.length })
  },
  
  validationError: (errors: string[]) => {
    trackEvent('media_validation_error', { errors, count: errors.length })
  },
  
  saved: (itemCounts: Record<string, number>) => {
    trackEvent('media_saved', itemCounts)
  },
  
  taskSubmitted: (taskId: string, mediaCount: number) => {
    trackEvent('task_submitted_with_media', { taskId, mediaCount })
  }
}

/**
 * Export analytics data (for debugging/analysis)
 */
export function exportAnalyticsData(): string {
  const events = getAnalyticsEvents()
  return JSON.stringify(events, null, 2)
}
