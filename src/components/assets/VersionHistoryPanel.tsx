"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetVersion } from "@/types/creative"
import { VersionStatusBadge } from "./VersionStatusBadge"
import { formatDistanceToNow } from "date-fns"
import { Plus, Eye, ArrowLeftRight } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface VersionHistoryPanelProps {
  versions: AssetVersion[]
  currentVersionId: string
  onVersionSelect: (versionId: string) => void
  onCompare?: (versionId: string) => void
  onNewVersion?: () => void
}

export function VersionHistoryPanel({
  versions,
  currentVersionId,
  onVersionSelect,
  onCompare,
  onNewVersion,
}: VersionHistoryPanelProps) {
  // Sort versions by version number descending (newest first)
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Version History</CardTitle>
          {onNewVersion && (
            <Button size="sm" onClick={onNewVersion} className="h-7 px-2">
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedVersions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No versions yet
          </p>
        ) : (
          <div className="space-y-3">
            {sortedVersions.map((version, index) => {
              const isCurrent = version.id === currentVersionId
              const isLast = index === sortedVersions.length - 1

              return (
                <div key={version.id} className="relative">
                  {/* Timeline connector */}
                  {!isLast && (
                    <div className="absolute left-[11px] top-8 bottom-[-12px] w-0.5 bg-border" />
                  )}

                  <div
                    className={cn(
                      "relative flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      isCurrent
                        ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => onVersionSelect(version.id)}
                  >
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0 mt-1">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          isCurrent
                            ? "bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900"
                            : "bg-muted-foreground"
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Version header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              v{version.versionNumber}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500 text-white">
                                Current
                              </span>
                            )}
                          </div>
                          <VersionStatusBadge
                            status={version.status}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Thumbnail */}
                      {version.thumbnailUrl && (
                        <div className="relative w-full h-16 rounded overflow-hidden bg-muted">
                          <Image
                            src={version.thumbnailUrl}
                            alt={version.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          by {version.uploadedByName} •{" "}
                          {formatDistanceToNow(version.uploadedAt, { addSuffix: true })}
                        </p>
                        {version.changeNotes && (
                          <p className="italic line-clamp-2">&quot;{version.changeNotes}&quot;</p>
                        )}
                        {version.commentsCount > 0 && (
                          <p>💬 {version.commentsCount} {version.commentsCount === 1 ? 'comment' : 'comments'}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            onVersionSelect(version.id)
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {onCompare && !isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              onCompare(version.id)
                            }}
                          >
                            <ArrowLeftRight className="h-3 w-3 mr-1" />
                            Compare
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
