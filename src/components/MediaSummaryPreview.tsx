'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Paperclip, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaManagerData } from '@/types/mediaManager'

/**
 * Media Summary Preview Component
 * 
 * Displays a collapsible summary of attached media in the task modal.
 * Shows assets, prompts, references, and creators with their status.
 * 
 * @param mediaData - Media manager data to display
 * @param onEdit - Callback when user clicks "Edit Media"
 * @param className - Optional CSS classes
 * 
 * @example
 * <MediaSummaryPreview
 *   mediaData={taskFormData.mediaData}
 *   onEdit={() => setShowMediaManager(true)}
 * />
 */
interface MediaSummaryPreviewProps {
  mediaData: MediaManagerData
  onEdit: () => void
  className?: string
}

export function MediaSummaryPreview({
  mediaData,
  onEdit,
  className
}: MediaSummaryPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalItems = 
    mediaData.assets.length +
    (mediaData.prompts.text.trim().length > 0 ? 1 : 0) +
    mediaData.training.length +
    mediaData.references.length +
    mediaData.creatorDNA.length

  if (totalItems === 0) return null

  return (
    <div className={cn(
      "border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50",
      className
    )}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <div className="flex items-center gap-3">
          <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Media Summary
          </span>
          <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-4 space-y-4">
          {/* Assets */}
          {mediaData.assets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assets ({mediaData.assets.length}):
              </h4>
              <div className="space-y-1">
                {mediaData.assets.slice(0, 5).map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    {asset.clearanceStatus === 'cleared' ? (
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : asset.clearanceStatus === 'pending' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{asset.filename}</span>
                    {asset.clearanceStatus === 'pending' && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">Pending</span>
                    )}
                  </div>
                ))}
                {mediaData.assets.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{mediaData.assets.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Prompts */}
          {mediaData.prompts.text.trim().length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompts (1):
              </h4>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">
                    "{mediaData.prompts.text.substring(0, 60)}..."
                  </p>
                  {mediaData.prompts.saveToLibrary && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      (Saved to library)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Training Data */}
          {mediaData.training.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Training Data ({mediaData.training.length}):
              </h4>
              <div className="space-y-1">
                {mediaData.training.slice(0, 3).map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="truncate">{dataset.filename}</span>
                  </div>
                ))}
                {mediaData.training.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{mediaData.training.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* References */}
          {mediaData.references.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                References ({mediaData.references.length}):
              </h4>
              <div className="space-y-1">
                {mediaData.references.slice(0, 3).map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    {ref.type === 'url' ? (
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {ref.type === 'url' ? ref.url : ref.filename}
                    </span>
                  </div>
                ))}
                {mediaData.references.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{mediaData.references.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Creator DNA */}
          {mediaData.creatorDNA.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Creator DNA ({mediaData.creatorDNA.length}):
              </h4>
              <div className="space-y-1">
                {mediaData.creatorDNA.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    {creator.authorizationStatus === 'authorized' ? (
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : creator.authorizationStatus === 'expires-soon' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                    ) : creator.authorizationStatus === 'expired' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate">{creator.name}</span>
                    <span className="text-xs text-gray-500">
                      {creator.authorizationStatus === 'authorized' ? 'Authorized' :
                       creator.authorizationStatus === 'expires-soon' ? 'Expires Soon' :
                       creator.authorizationStatus === 'expired' ? 'Expired' :
                       'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onEdit}
              className="w-full px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 transition font-medium"
            >
              Edit Media
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
