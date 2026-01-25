import type { PromptLibraryItem } from '@/lib/mockData/promptLibrary'
import { MOCK_PROMPT_LIBRARY } from '@/lib/mockData'

export interface PromptSuggestion {
  prompt: PromptLibraryItem
  relevanceScore: number
  matchReasons: string[]
}

export interface PromptSuggestionParams {
  creativeType?: string
  toolUsed?: string
  intendedUse?: string
  limit?: number
}

/**
 * Get relevant prompt suggestions based on task context
 * 
 * Scoring system (0-100):
 * - Exact creative type match: +40 points
 * - Same tool used: +30 points
 * - Same intended use: +20 points
 * - High effectiveness rating (4-5 stars): +10 points
 * - High usage count (>10 uses): +5 points
 * - Recent usage (last 30 days): +5 points
 * - Similar tags: +2 points per matching tag
 */
export function getRelevantPrompts(params: PromptSuggestionParams): PromptSuggestion[] {
  const { creativeType, toolUsed, intendedUse, limit = 5 } = params
  
  // If no context provided, return empty
  if (!creativeType && !toolUsed && !intendedUse) {
    return []
  }
  
  const suggestions: PromptSuggestion[] = MOCK_PROMPT_LIBRARY.map(prompt => {
    let score = 0
    const matchReasons: string[] = []
    
    // 1. Creative type match (+40 points)
    if (creativeType && prompt.creativeType.toLowerCase() === creativeType.toLowerCase()) {
      score += 40
      matchReasons.push('Same creative type')
    }
    
    // 2. Tool match (+30 points)
    if (toolUsed && prompt.toolUsed.toLowerCase() === toolUsed.toLowerCase()) {
      score += 30
      matchReasons.push('Same tool')
    }
    
    // 3. Intended use match (+20 points)
    if (intendedUse && prompt.intendedUse.toLowerCase() === intendedUse.toLowerCase()) {
      score += 20
      matchReasons.push('Same intended use')
    }
    
    // 4. High effectiveness rating (+10 points for 4-5 stars)
    if (prompt.effectivenessRating >= 4.0) {
      score += 10
      matchReasons.push('Highly rated')
    }
    
    // 5. High usage count (+5 points for >10 uses)
    if (prompt.usageCount > 10) {
      score += 5
      matchReasons.push('Frequently used')
    }
    
    // 6. Recent usage (+5 points for last 30 days)
    const daysSinceLastUse = (Date.now() - prompt.lastUsedDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLastUse <= 30) {
      score += 5
      matchReasons.push('Recently used')
    }
    
    // 7. Similar tags (+2 points per matching tag)
    const contextTags = [
      creativeType?.toLowerCase(),
      toolUsed?.toLowerCase(),
      intendedUse?.toLowerCase()
    ].filter(Boolean)
    
    const matchingTags = prompt.tags.filter(tag => 
      contextTags.some(contextTag => tag.toLowerCase().includes(contextTag || ''))
    )
    
    if (matchingTags.length > 0) {
      score += matchingTags.length * 2
      if (matchingTags.length > 2) {
        matchReasons.push('Similar tags')
      }
    }
    
    return {
      prompt,
      relevanceScore: Math.min(score, 100), // Cap at 100
      matchReasons
    }
  })
  
  // Filter out prompts with score of 0 (no matches)
  const filtered = suggestions.filter(s => s.relevanceScore > 0)
  
  // Sort by relevance score (highest first)
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore)
  
  // Return top N prompts
  return filtered.slice(0, limit)
}

/**
 * Get match indicator based on relevance score
 */
export function getMatchIndicator(score: number): { emoji: string; label: string; color: string } {
  if (score >= 80) {
    return { emoji: '🎯', label: 'Perfect match', color: 'text-green-600 dark:text-green-400' }
  } else if (score >= 50) {
    return { emoji: '✓', label: 'Good match', color: 'text-blue-600 dark:text-blue-400' }
  } else {
    return { emoji: '·', label: 'Related', color: 'text-gray-600 dark:text-gray-400' }
  }
}

/**
 * Format star rating for display
 */
export function formatStarRating(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  
  return { full, half, empty }
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
}

/**
 * Track prompt usage in localStorage
 */
export function trackPromptUsage(
  promptId: string,
  taskType: string,
  tool?: string
): void {
  if (typeof window === 'undefined') return
  
  const usage = {
    promptId,
    usedAt: new Date().toISOString(),
    taskType,
    tool
  }
  
  // Get existing usage history
  const historyJson = localStorage.getItem('prompt-usage-history')
  const history = historyJson ? JSON.parse(historyJson) : []
  
  // Add new usage
  history.push(usage)
  
  // Keep only last 100 usages
  if (history.length > 100) {
    history.shift()
  }
  
  // Save back to localStorage
  localStorage.setItem('prompt-usage-history', JSON.stringify(history))
  
  // Update the prompt's usage count and last used date in mock data
  const prompt = MOCK_PROMPT_LIBRARY.find(p => p.id === promptId)
  if (prompt) {
    prompt.usageCount += 1
    prompt.lastUsedDate = new Date()
  }
}

/**
 * Get prompt usage history from localStorage
 */
export function getPromptUsageHistory(): Array<{
  promptId: string
  usedAt: string
  taskType: string
  tool?: string
}> {
  if (typeof window === 'undefined') return []
  
  const historyJson = localStorage.getItem('prompt-usage-history')
  return historyJson ? JSON.parse(historyJson) : []
}

/**
 * Get user's most used prompts
 */
export function getUserFavoritePrompts(limit: number = 5): PromptLibraryItem[] {
  const history = getPromptUsageHistory()
  
  // Count usage by prompt ID
  const usageCounts = new Map<string, number>()
  history.forEach(usage => {
    usageCounts.set(usage.promptId, (usageCounts.get(usage.promptId) || 0) + 1)
  })
  
  // Sort by usage count
  const sortedPromptIds = Array.from(usageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([promptId]) => promptId)
  
  // Get prompt objects
  return sortedPromptIds
    .map(id => MOCK_PROMPT_LIBRARY.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, limit) as PromptLibraryItem[]
}
