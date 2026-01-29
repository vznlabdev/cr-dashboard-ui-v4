"use client"

import { cn } from "@/lib/utils"
import { Check, Lock } from "lucide-react"
import type { SetupCategory } from "@/lib/contexts/setup-context"

interface SetupCategoryItemProps {
  category: SetupCategory
  isSelected: boolean
  onClick: () => void
}

export function SetupCategoryItem({
  category,
  isSelected,
  onClick,
}: SetupCategoryItemProps) {
  const completedCount = category.tasks.filter((task) => task.completed).length
  const totalCount = category.tasks.length
  const isComplete = completedCount === totalCount
  const progressText = `${completedCount} of ${totalCount} steps complete`

  return (
    <button
      onClick={onClick}
      disabled={category.locked}
      className={cn(
        "w-full text-left rounded-lg border transition-all",
        isSelected
          ? "bg-accent border-blue-500 dark:border-blue-600"
          : "bg-background border-border hover:border-blue-300 dark:hover:border-blue-700",
        category.locked && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="p-4">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm leading-tight flex-1">
            {category.title}
          </h3>
          {category.locked && (
            <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          )}
          {!category.locked && isComplete && (
            <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>

        {/* Progress text */}
        <p className="text-xs text-muted-foreground">{progressText}</p>

        {/* Mini task list when selected */}
        {isSelected && !category.locked && (
          <div className="mt-3 space-y-1.5 pt-3 border-t border-border">
            {category.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 text-xs"
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-sm border flex items-center justify-center shrink-0",
                    task.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  )}
                >
                  {task.completed && (
                    <Check className="h-2 w-2 text-primary-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    task.completed && "text-muted-foreground line-through"
                  )}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
