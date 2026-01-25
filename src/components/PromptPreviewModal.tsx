'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, Star, Calendar, User, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PromptLibraryItem } from '@/lib/mockData/promptLibrary'
import { formatStarRating, getRelativeTime } from '@/lib/promptSuggestions'

interface PromptPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  prompt: PromptLibraryItem | null
  onUsePrompt: (promptText: string) => void
}

export function PromptPreviewModal({
  isOpen,
  onClose,
  prompt,
  onUsePrompt
}: PromptPreviewModalProps) {
  if (!prompt) return null

  const handleUsePrompt = () => {
    onUsePrompt(prompt.promptText)
    onClose()
  }

  const stars = formatStarRating(prompt.effectivenessRating)
  const successRate = Math.round((prompt.successfulOutputs / prompt.usageCount) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {prompt.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Rating and Stats */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Star Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(stars.full)].map((_, i) => (
                  <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                {stars.half && (
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />
                )}
                {[...Array(stars.empty)].map((_, i) => (
                  <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {prompt.effectivenessRating.toFixed(1)}
              </span>
            </div>

            <span className="text-sm text-gray-500">•</span>

            {/* Usage Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {prompt.usageCount} use{prompt.usageCount !== 1 ? 's' : ''}
            </div>

            <span className="text-sm text-gray-500">•</span>

            {/* Success Rate */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {successRate}% success rate
            </div>
          </div>

          {/* Full Prompt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Prompt Text:
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {prompt.promptText}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Metadata:
            </label>
            <div className="space-y-3">
              {/* Creative Type */}
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Creative Type:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {prompt.creativeType}
                  </span>
                </div>
              </div>

              {/* Tool */}
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tool:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {prompt.toolUsed}
                  </span>
                </div>
              </div>

              {/* Intended Use */}
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Intended Use:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {prompt.intendedUse}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {prompt.tags.length > 0 && (
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {prompt.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Creator */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created by:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {prompt.createdBy}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    on {prompt.createdDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Last Used */}
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last used:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {getRelativeTime(prompt.lastUsedDate)}
                  </span>
                </div>
              </div>

              {/* Average Output Quality */}
              <div className="flex items-start gap-3">
                <Star className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average output quality:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {prompt.effectivenessRating.toFixed(1)}/5.0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUsePrompt}
            className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Use This Prompt
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
