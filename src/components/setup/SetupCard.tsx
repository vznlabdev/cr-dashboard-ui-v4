"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ChevronDown, Lock } from "lucide-react"
import { useState } from "react"
import type { SetupCategory } from "@/lib/contexts/setup-context"

interface SetupCardProps {
  category: SetupCategory
  onTaskToggle: (categoryId: string, taskId: string) => void
}

export function SetupCard({ category, onTaskToggle }: SetupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const completedCount = category.tasks.filter((task) => task.completed).length
  const totalCount = category.tasks.length
  const progressText = `${completedCount} of ${totalCount} steps complete`

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        category.locked && "opacity-60"
      )}
    >
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Header with title and lock icon */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
            </div>
            {category.locked && (
              <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
          </div>

          {/* Progress text */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{progressText}</span>
            {!category.locked && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{isExpanded ? "Hide" : "Show"} tasks</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expandable task list */}
      {isExpanded && !category.locked && (
        <CardContent className="pt-0">
          <div className="space-y-2.5 border-t border-border pt-3">
            {category.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 group"
              >
                <Checkbox
                  id={`${category.id}-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => onTaskToggle(category.id, task.id)}
                  className="shrink-0"
                />
                <label
                  htmlFor={`${category.id}-${task.id}`}
                  className={cn(
                    "text-sm cursor-pointer select-none flex-1",
                    task.completed && "text-muted-foreground line-through"
                  )}
                >
                  {task.title}
                  {task.required && (
                    <span className="text-xs text-red-500 ml-1">*</span>
                  )}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            <span className="text-red-500">*</span> Required to complete setup
          </p>
        </CardContent>
      )}
    </Card>
  )
}
