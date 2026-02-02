"use client"

import { TrendingUp, AlertTriangle, TrendingDown, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProjectUpdate } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface ProjectUpdateItemProps {
  update: ProjectUpdate
  isExpanded?: boolean
  onToggle?: () => void
}

const healthConfig = {
  "on-track": {
    icon: TrendingUp,
    color: "text-green-600",
    label: "On track"
  },
  "at-risk": {
    icon: AlertTriangle,
    color: "text-yellow-600",
    label: "At risk"
  },
  "off-track": {
    icon: TrendingDown,
    color: "text-red-600",
    label: "Off track"
  }
}

export function ProjectUpdateItem({ update, isExpanded, onToggle }: ProjectUpdateItemProps) {
  const health = healthConfig[update.healthStatus]
  const HealthIcon = health.icon

  if (!isExpanded) {
    // Compact view
    return (
      <div 
        className="flex items-start gap-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-md -mx-2 px-2"
        onClick={onToggle}
      >
        {/* User Avatar */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: update.author.color }}
        >
          {update.author.initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{update.author.name}</span>
            <HealthIcon className={cn("h-3.5 w-3.5", health.color)} />
            <span className={cn("text-xs", health.color)}>{health.label}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {update.content}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(update.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    )
  }

  // Expanded view
  return (
    <div 
      className="py-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-md -mx-2 px-2"
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* User Avatar */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: update.author.color }}
        >
          {update.author.initials}
        </div>

        {/* Author and Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{update.author.name}</span>
            <HealthIcon className={cn("h-3.5 w-3.5", health.color)} />
            <span className={cn("text-xs font-medium", health.color)}>{health.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDistanceToNow(update.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Full Content */}
      <div className="ml-9 space-y-3">
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {update.content}
        </p>

        {/* Metadata Bar */}
        <div className="border-l-2 border-border pl-3 py-2 space-y-1.5 text-xs">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="text-xs">
              {update.metadata.status}
            </Badge>
          </div>

          {/* Lead */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Lead</span>
            <span className="text-foreground">{update.metadata.lead}</span>
          </div>

          {/* Target Date */}
          {update.metadata.targetDate && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Target date</span>
              <span className="text-foreground">{update.metadata.targetDate}</span>
            </div>
          )}

          {/* Progress */}
          {update.metadata.progress && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground">{update.metadata.progress}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
