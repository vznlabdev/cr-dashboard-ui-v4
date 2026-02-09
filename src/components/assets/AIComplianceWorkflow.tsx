"use client"

import { User, Sparkles, Settings, Database, FileText, Image as ImageIcon, Shield, ChevronRight, Check, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type TalentStepStatus = "not_applicable" | "pending" | "verified"

interface AIComplianceWorkflowProps {
  assetId: string
  copyrightCheckStatus?: string
  talentStepStatus?: TalentStepStatus
}

const WORKFLOW_STEPS = [
  { id: 1, name: "Creator", icon: User },
  { id: 2, name: "Tool", icon: Sparkles },
  { id: 3, name: "Model", icon: Settings },
  { id: 4, name: "Training", icon: Database },
  { id: 5, name: "Talent", icon: Users, optional: true },
  { id: 6, name: "Prompt", icon: FileText },
  { id: 7, name: "Output", icon: ImageIcon },
  { id: 8, name: "Copyright", icon: Shield },
]

const TALENT_TOOLTIP =
  "Verifies name, image, likeness, and personality rights when identifiable individuals appear in generated content. Only required for content featuring recognizable people."

export function AIComplianceWorkflow({
  assetId,
  copyrightCheckStatus,
  talentStepStatus = "not_applicable",
}: AIComplianceWorkflowProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon
          const isTalentStep = step.id === 5
          const isCopyrightStep = step.id === 8

          const copyrightCompleted = isCopyrightStep && copyrightCheckStatus === "completed"
          const copyrightIncomplete = isCopyrightStep && !copyrightCompleted

          const talentNotApplicable = isTalentStep && talentStepStatus === "not_applicable"
          const talentPending = isTalentStep && talentStepStatus === "pending"
          const talentVerified = isTalentStep && talentStepStatus === "verified"

          const isCompleted =
            isCopyrightStep
              ? copyrightCompleted
              : isTalentStep
                ? talentNotApplicable || talentVerified
                : true

          const stepContent = (
            <div className={(step as { optional?: boolean }).optional ? "min-w-0" : ""}>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap",
                  isTalentStep && talentPending && "border-amber-400/70 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-600/50",
                  isTalentStep && (talentNotApplicable || talentVerified) && !talentPending &&
                    (talentVerified
                      ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/30 dark:border-teal-800 dark:text-teal-300"
                      : "bg-muted border-border text-muted-foreground"),
                  !isTalentStep && isCompleted &&
                    "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300",
                  !isTalentStep && !isCompleted && "bg-muted border-border text-muted-foreground",
                  copyrightIncomplete &&
                    "animate-pulse border-amber-400/70 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-600/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] dark:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                )}
              >
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span>{step.name}</span>
                {isTalentStep && talentNotApplicable && (
                  <span className="text-[9px] font-normal opacity-80 ml-0.5">N/A</span>
                )}
                {(isCompleted || (isTalentStep && talentVerified)) && (
                  <Check
                    className={cn(
                      "h-3 w-3 flex-shrink-0",
                      isTalentStep && talentVerified && "text-teal-600 dark:text-teal-400",
                      isTalentStep && talentNotApplicable && "text-muted-foreground",
                      !isTalentStep && isCompleted && "text-emerald-600 dark:text-emerald-400"
                    )}
                  />
                )}
              </div>
            </div>
          )

          return (
            <div key={step.id} className="flex items-center gap-2">
              {isTalentStep ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">{stepContent}</div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[280px]">
                      <p className="text-xs">{TALENT_TOOLTIP}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                stepContent
              )}
              {index < WORKFLOW_STEPS.length - 1 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
