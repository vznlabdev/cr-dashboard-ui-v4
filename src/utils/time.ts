/**
 * Time formatting utilities for Creation Rights Dashboard
 */

/**
 * Format a date as relative time (e.g., "2h ago", "3d ago", "2w ago")
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) {
    return 'just now'
  }
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }
  
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}d ago`
  }
  
  const weeks = Math.floor(days / 7)
  if (weeks < 4) {
    return `${weeks}w ago`
  }
  
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}mo ago`
  }
  
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

/**
 * Calculate difference in days between two dates
 */
export function differenceInDays(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

/**
 * Group activities by time periods
 */
export function groupByTime<T extends { timestamp: Date }>(
  items: T[]
): {
  today: T[]
  yesterday: T[]
  thisWeek: T[]
  older: T[]
} {
  const now = new Date()
  const groups = {
    today: [] as T[],
    yesterday: [] as T[],
    thisWeek: [] as T[],
    older: [] as T[],
  }
  
  items.forEach((item) => {
    const daysDiff = differenceInDays(now, item.timestamp)
    if (daysDiff === 0) {
      groups.today.push(item)
    } else if (daysDiff === 1) {
      groups.yesterday.push(item)
    } else if (daysDiff <= 7) {
      groups.thisWeek.push(item)
    } else {
      groups.older.push(item)
    }
  })
  
  return groups
}
