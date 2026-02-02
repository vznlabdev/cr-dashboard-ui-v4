'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { format } from 'date-fns'

interface ScoreBadgeProps {
  icon: LucideIcon
  score?: number
  label?: string
  lastChecked?: Date
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({
  icon: Icon,
  score,
  label,
  lastChecked,
  onClick,
  size = 'sm'
}: ScoreBadgeProps) {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 50) return 'amber'
    return 'red'
  }

  const getScoreStyles = (score: number) => {
    if (score >= 80) {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    }
    if (score >= 50) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
    }
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  }

  const sizeStyles = {
    sm: 'h-6 px-1.5 text-xs',
    md: 'h-7 px-2 text-sm',
    lg: 'h-8 px-3 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }

  if (score === undefined) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'flex items-center gap-1 border',
          sizeStyles[size],
          onClick && 'cursor-pointer hover:bg-muted/50'
        )}
        onClick={onClick}
      >
        <Icon className={iconSizes[size]} />
        <span>—</span>
      </Badge>
    )
  }

  const tooltipContent = (
    <div className="text-xs space-y-1">
      {label && <div className="font-semibold">{label}</div>}
      <div>Score: {score}/100</div>
      {lastChecked && (
        <div className="text-muted-foreground">
          Checked: {format(lastChecked, 'MMM d, yyyy h:mm a')}
        </div>
      )}
      {onClick && <div className="text-muted-foreground italic mt-1">Click to re-run</div>}
    </div>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={cn(
              'flex items-center gap-1 border',
              sizeStyles[size],
              getScoreStyles(score),
              onClick && 'cursor-pointer hover:opacity-80 transition-opacity'
            )}
            onClick={onClick}
          >
            <Icon className={iconSizes[size]} />
            <span className="font-semibold">{score}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
