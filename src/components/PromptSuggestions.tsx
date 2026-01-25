'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, Lightbulb, TrendingUp, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PromptLibraryItem } from '@/lib/mockData/promptLibrary'
import { 
  getRelevantPrompts, 
  getMatchIndicator, 
  formatStarRating, 
  getRelativeTime,
  trackPromptUsage
} from '@/lib/promptSuggestions'
import { PromptPreviewModal } from './PromptPreviewModal'

interface PromptSuggestionsProps {
  creativeType?: string
  toolUsed?: string
  intendedUse?: string
  onSelectPrompt: (promptText: string) => void
  className?: string
}

type SortOption = 'relevance' | 'rating' | 'usage' | 'recent'

export function PromptSuggestions({
  creativeType,
  toolUsed,
  intendedUse,
  onSelectPrompt,
  className
}: PromptSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [previewPrompt, setPreviewPrompt] = useState<PromptLibraryItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Get suggestions
  const suggestions = getRelevantPrompts({
    creativeType,
    toolUsed,
    intendedUse,
    limit: 5
  })

  // Sort suggestions based on selected option
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return b.relevanceScore - a.relevanceScore
      case 'rating':
        return b.prompt.effectivenessRating - a.prompt.effectivenessRating
      case 'usage':
        return b.prompt.usageCount - a.prompt.usageCount
      case 'recent':
        return b.prompt.lastUsedDate.getTime() - a.prompt.lastUsedDate.getTime()
      default:
        return 0
    }
  })

  const hasContext = Boolean(creativeType || toolUsed || intendedUse)

  const handleUsePrompt = (prompt: PromptLibraryItem) => {
    onSelectPrompt(prompt.promptText)
    trackPromptUsage(prompt.id, creativeType || 'unknown', toolUsed)
  }

  const handlePreviewPrompt = (prompt: PromptLibraryItem) => {
    setPreviewPrompt(prompt)
    setIsPreviewOpen(true)
  }

  const handleUseFromPreview = (promptText: string) => {
    onSelectPrompt(promptText)
    if (previewPrompt) {
      trackPromptUsage(previewPrompt.id, creativeType || 'unknown', toolUsed)
    }
  }

  // Context display
  const contextParts = [
    creativeType,
    toolUsed,
    intendedUse
  ].filter(Boolean)

  return (
    <>
      <div className={cn("border border-gray-200 dark:border-gray-800 rounded-lg", className)}>
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Suggested Prompts
            </span>
            {suggestions.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                {suggestions.length}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* Context Display */}
            {hasContext && contextParts.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span>Based on:</span>
                {contextParts.map((part, index) => (
                  <span key={index}>
                    <span className="font-medium text-gray-900 dark:text-white">{part}</span>
                    {index < contextParts.length - 1 && <span className="mx-1">•</span>}
                  </span>
                ))}
              </div>
            )}

            {/* No Context State */}
            {!hasContext && (
              <div className="py-8 text-center">
                <Lightbulb className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Prompt Suggestions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Complete the task details above to see relevant prompt suggestions:
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
                  <li>• Creative Type</li>
                  <li>• Approved Tools (if AI method)</li>
                  <li>• Intended Use</li>
                </ul>
              </div>
            )}

            {/* No Suggestions Found */}
            {hasContext && suggestions.length === 0 && (
              <div className="py-8 text-center">
                <Lightbulb className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  No similar prompts found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You'll be creating a new prompt for this combination. Make it great and it'll help future projects!
                </p>
                <div className="text-left max-w-md mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Tips for effective prompts:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Be specific about style and mood</li>
                    <li>• Include technical details (lighting, composition)</li>
                    <li>• Reference examples when helpful</li>
                    <li>• Specify output format and dimensions</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <>
                {/* Sort Controls */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    Showing {sortedSuggestions.length} suggestion{sortedSuggestions.length !== 1 ? 's' : ''}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="rating">Sort by: Rating</option>
                    <option value="usage">Sort by: Usage</option>
                    <option value="recent">Sort by: Recent</option>
                  </select>
                </div>

                {/* Suggestion Cards */}
                <div className="space-y-3 mt-3">
                  {sortedSuggestions.map((suggestion) => {
                    const { prompt, relevanceScore, matchReasons } = suggestion
                    const stars = formatStarRating(prompt.effectivenessRating)
                    const matchIndicator = getMatchIndicator(relevanceScore)
                    const truncatedText = prompt.promptText.length > 100
                      ? prompt.promptText.substring(0, 100) + '...'
                      : prompt.promptText

                    return (
                      <div
                        key={prompt.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition"
                      >
                        {/* Rating and Match Indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {/* Stars */}
                            <div className="flex items-center gap-1">
                              {[...Array(stars.full)].map((_, i) => (
                                <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                              {stars.half && (
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 opacity-50" />
                              )}
                              {[...Array(stars.empty)].map((_, i) => (
                                <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                              ))}
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              ({prompt.effectivenessRating.toFixed(1)})
                            </span>
                          </div>

                          {/* Usage Count */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TrendingUp className="w-3 h-3" />
                            <span>Used {prompt.usageCount} times</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {prompt.title}
                        </h4>

                        {/* Match Indicator */}
                        {matchReasons.length > 0 && (
                          <div className={cn("flex items-center gap-1 text-xs mb-2", matchIndicator.color)}>
                            <span>{matchIndicator.emoji}</span>
                            <span>{matchIndicator.label}: {matchReasons.join(', ')}</span>
                          </div>
                        )}

                        {/* Preview Text */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          "{truncatedText}"
                        </p>

                        {/* Creator and Time */}
                        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{prompt.createdBy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Last used {getRelativeTime(prompt.lastUsedDate)}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {prompt.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {prompt.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500">
                              +{prompt.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUsePrompt(prompt)}
                            className="flex-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
                          >
                            Use This Prompt
                          </button>
                          <button
                            onClick={() => handlePreviewPrompt(prompt)}
                            className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium transition"
                          >
                            Preview Full
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <PromptPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setPreviewPrompt(null)
        }}
        prompt={previewPrompt}
        onUsePrompt={handleUseFromPreview}
      />
    </>
  )
}
