"use client"

import { Fragment } from "react"
import type { WorkflowStepConfig, WorkflowStepStatus } from "@/types/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import { cn } from "@/lib/utils"

interface WorkflowProgressBarProps {
  steps: WorkflowStepConfig[]
  stepStatuses: WorkflowStepStatus[]
  currentStepIndex: number
  compact?: boolean
}

export function WorkflowProgressBar({
  steps,
  stepStatuses,
  currentStepIndex,
  compact = false,
}: WorkflowProgressBarProps) {
  return (
    <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-0.5")}>
      {steps.map((step, index) => {
        const config = STEP_TYPE_CONFIG[step.stepType]
        const status = stepStatuses[index]
        const isCompleted =
          status?.status === "completed" || status?.status === "skipped"
        const isActive =
          index === currentStepIndex && status?.status === "active"
        const ringColor = config.color.replace("bg-", "ring-")

        return (
          <Fragment key={step.id}>
            <div
              className={cn(
                "rounded-full shrink-0",
                compact ? "h-1.5 w-1.5" : "h-2.5 w-2.5",
                isCompleted && config.color,
                isActive &&
                  cn(
                    config.color,
                    "ring-1 ring-offset-1 ring-offset-background",
                    ringColor
                  ),
                !isCompleted && !isActive && "bg-muted"
              )}
            />
            {index < steps.length - 1 && (
              <div
                className={cn(
                  compact ? "h-px w-1" : "h-px w-2",
                  isCompleted ? "bg-foreground/15" : "bg-border"
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
