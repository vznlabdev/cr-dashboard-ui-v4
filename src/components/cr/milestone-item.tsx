"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MilestoneItemProps {
  name: string
  progress: number
  total: number
  dueDate?: string
  status?: "on-track" | "at-risk" | "overdue"
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function MilestoneItem({
  name,
  progress,
  total,
  dueDate,
  status = "on-track",
  onEdit,
  onDelete,
  className,
}: MilestoneItemProps) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0

  return (
    <div className={cn("flex items-start gap-3 py-3 group", className)}>
      {/* Milestone Icon */}
      <div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
          status === "on-track" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
          status === "at-risk" && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
          status === "overdue" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        )}
      >
        <Target className="h-3.5 w-3.5" />
      </div>

      {/* Milestone Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            {dueDate && (
              <p className="text-xs text-muted-foreground mt-0.5">{dueDate}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {progress} of {total}
            </span>
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      Edit milestone
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      Delete milestone
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={percentage} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{percentage}%</p>
        </div>
      </div>
    </div>
  )
}
