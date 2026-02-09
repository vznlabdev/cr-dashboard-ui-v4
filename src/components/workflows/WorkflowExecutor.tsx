"use client"

import { useState, Fragment, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Lock,
  SkipForward,
  ArrowLeft,
  Eye,
  Download,
} from "lucide-react"
import type {
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowStepStatus,
} from "@/types/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import { aiToolsWhitelist } from "@/lib/ai-tools-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface WorkflowExecutorProps {
  template: WorkflowTemplate
  instance: WorkflowInstance
  onUpdateInstance: (updated: WorkflowInstance) => void
}

function getRemainingMinutes(
  template: WorkflowTemplate,
  stepStatuses: WorkflowStepStatus[]
): number {
  return template.steps.reduce((sum, step, i) => {
    const status = stepStatuses[i]?.status
    if (status === "completed" || status === "skipped") return sum
    return sum + (step.estimatedMinutes ?? 0)
  }, 0)
}

export function WorkflowExecutor({
  template,
  instance,
  onUpdateInstance,
}: WorkflowExecutorProps) {
  const [localInstance, setLocalInstance] = useState<WorkflowInstance>(instance)
  const [viewingStepIndex, setViewingStepIndex] = useState<number | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})

  const currentStepIndex = localInstance.currentStepIndex
  const currentStep = template.steps[currentStepIndex]
  const displayIndex =
    viewingStepIndex !== null ? viewingStepIndex : currentStepIndex
  const step = template.steps[displayIndex]
  const status = localInstance.stepStatuses[displayIndex]
  const totalSteps = template.steps.length
  const completedCount = localInstance.stepStatuses.filter(
    (s) => s.status === "completed" || s.status === "skipped"
  ).length
  const remainingMinutes = getRemainingMinutes(
    template,
    localInstance.stepStatuses
  )
  const isViewingCompletedStep =
    viewingStepIndex !== null && viewingStepIndex !== currentStepIndex
  const isLastStep = currentStepIndex === totalSteps - 1

  useEffect(() => {
    setCheckedItems({})
  }, [displayIndex])

  function handleCompleteStep() {
    const next = { ...localInstance }
    const stepStatus = next.stepStatuses[currentStepIndex]
    if (!stepStatus) return
    stepStatus.status = "completed"
    stepStatus.completedAt = new Date().toISOString()

    if (currentStepIndex < totalSteps - 1) {
      next.currentStepIndex = currentStepIndex + 1
      const nextStatus = next.stepStatuses[next.currentStepIndex]
      if (nextStatus) {
        nextStatus.status = "active"
        nextStatus.startedAt = new Date().toISOString()
      }
    } else {
      next.status = "completed"
      next.completedAt = new Date().toISOString()
    }

    setLocalInstance(next)
    onUpdateInstance(next)
    setViewingStepIndex(null)
    setCheckedItems({})
    toast.success(
      isLastStep ? "Workflow completed!" : "Step completed. Next step ready."
    )
  }

  function handleSkipStep() {
    const next = { ...localInstance }
    const stepStatus = next.stepStatuses[currentStepIndex]
    if (!stepStatus) return
    stepStatus.status = "skipped"
    stepStatus.completedAt = new Date().toISOString()

    if (currentStepIndex < totalSteps - 1) {
      next.currentStepIndex = currentStepIndex + 1
      const nextStatus = next.stepStatuses[next.currentStepIndex]
      if (nextStatus) {
        nextStatus.status = "active"
        nextStatus.startedAt = new Date().toISOString()
      }
    } else {
      next.status = "completed"
      next.completedAt = new Date().toISOString()
    }

    setLocalInstance(next)
    onUpdateInstance(next)
    setViewingStepIndex(null)
    setCheckedItems({})
    toast.success("Step skipped.")
  }

  function goToPreviousStep() {
    if (currentStepIndex > 0) {
      setViewingStepIndex(currentStepIndex - 1)
    }
  }

  if (localInstance.status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold">Workflow Complete</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All {template.steps.length} steps completed
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Completed{" "}
          {localInstance.completedAt
            ? new Date(localInstance.completedAt).toLocaleString()
            : ""}
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => toast.info("Evidence export coming soon")}
          >
            <Download className="mr-2 h-4 w-4" /> Export Evidence
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Fragment>
      {/* Top progress bar */}
      <div className="border-b pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{template.icon}</span>
            <div>
              <h2 className="text-sm font-semibold">{template.name}</h2>
              <p className="text-xs text-muted-foreground">
                Step {currentStepIndex + 1} of {totalSteps} —{" "}
                {currentStep?.name ?? ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> ~{remainingMinutes} min left
            </span>
            <div className="flex items-center gap-1">
              {template.steps.map((s, i) => {
                const st = localInstance.stepStatuses[i]
                const config = STEP_TYPE_CONFIG[s.stepType]
                const isCompleted =
                  st?.status === "completed" || st?.status === "skipped"
                const isActive = st?.status === "active"
                const ringColor = config.color.replace("bg-", "ring-")
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      isCompleted && config.color,
                      isActive &&
                        cn(config.color, "ring-2 ring-offset-1", ringColor),
                      !isCompleted && !isActive && "bg-muted"
                    )}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column */}
      <div className="flex gap-8">
        {/* Left: Step navigator */}
        <div className="w-56 shrink-0 space-y-1">
          {template.steps.map((s, index) => {
            const stepStatus = localInstance.stepStatuses[index]
            const config = STEP_TYPE_CONFIG[s.stepType]
            const isCompleted =
              stepStatus?.status === "completed" ||
              stepStatus?.status === "skipped"
            const isActive = stepStatus?.status === "active"
            const isLocked = stepStatus?.status === "locked"
            const isReady = stepStatus?.status === "ready"

            return (
              <button
                key={s.id}
                type="button"
                className={cn(
                  "w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-3",
                  isActive &&
                    cn(
                      config.lightBg,
                      "border-l-2",
                      config.borderColor
                    ),
                  isCompleted && "hover:bg-muted/50",
                  isLocked && "opacity-40 cursor-not-allowed",
                  !isActive && !isLocked && "hover:bg-muted/50"
                )}
                onClick={() => {
                  if (isCompleted) setViewingStepIndex(index)
                  if (isActive || isLocked) return
                  if (isReady) return // or could focus current
                }}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                    isCompleted && "bg-emerald-500 text-white",
                    isActive && cn(config.color, "text-white"),
                    isReady &&
                      cn(
                        "border-2 bg-transparent",
                        config.borderColor,
                        config.textColor
                      ),
                    isLocked && "bg-muted"
                  )}
                >
                  {isCompleted && <Check className="h-3.5 w-3.5" />}
                  {(isActive || isReady) && (
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  )}
                  {isLocked && (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-medium truncate",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {config.label}
                  </p>
                </div>
              </button>
            )
          })}
          <Separator className="my-2" />
          <div className="pt-3 px-2">
            <p className="text-[10px] text-muted-foreground mb-1">
              {completedCount} of {totalSteps} complete
            </p>
            <Progress
              value={totalSteps ? (completedCount / totalSteps) * 100 : 0}
              className="h-1.5"
            />
          </div>
        </div>

        {/* Right: Active step content */}
        <div className="flex-1 min-w-0">
          {step && status && (() => {
            const config = STEP_TYPE_CONFIG[step.stepType]
            const Icon = config.icon
            const tools = (step.recommendedToolIds ?? [])
              .map((id) => aiToolsWhitelist.find((t) => t.id === id))
              .filter((t): t is NonNullable<typeof t> => Boolean(t))

            return (
              <Fragment>
                {isViewingCompletedStep && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 mb-4">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Completed{" "}
                      {status.completedAt
                        ? new Date(status.completedAt).toLocaleString()
                        : ""}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-[10px] h-6"
                      onClick={() => setViewingStepIndex(null)}
                    >
                      Back to current step
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center border",
                      config.lightBg,
                      config.borderColor
                    )}
                  >
                    <Icon
                      className={cn("h-4 w-4", config.textColor)}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{step.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          config.textColor,
                          config.lightBg,
                          config.borderColor
                        )}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ~
                        {step.estimatedMinutes ?? 0} min
                      </span>
                    </div>
                  </div>
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {step.description}
                  </p>
                )}

                {/* Tools */}
                {tools.length > 0 && (
                  <Collapsible defaultOpen className="mt-6">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recommended Tools{" "}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        {tools.map((tool) => (
                          <Card
                            key={tool.id}
                            className="hover:border-blue-400 transition-colors"
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{tool.icon}</span>
                                <div>
                                  <p className="text-xs font-medium">
                                    {tool.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {tool.category}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[9px]"
                                >
                                  {tool.trackingLevel}
                                </Badge>
                                <Button
                                  size="sm"
                                  className="ml-auto h-6 text-[10px]"
                                  onClick={() => {
                                    window.open(tool.baseUrl, "_blank")
                                    toast.success(
                                      `Launched ${tool.name} — extension will track your session`
                                    )
                                  }}
                                >
                                  <ExternalLink className="mr-1 h-3 w-3" />{" "}
                                  Launch
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground">
                          Browser extension will automatically capture prompts,
                          generations, and downloads
                        </span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Prompt guide */}
                <Collapsible
                  defaultOpen={!!step.promptTemplate}
                  className="mt-4"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Prompt Guide <ChevronDown className="h-3.5 w-3.5" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    {step.promptTemplate && (
                      <div className="relative">
                        <Textarea
                          className="font-mono text-xs min-h-[80px] resize-y"
                          defaultValue={step.promptTemplate}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-1.5 right-1.5 h-6 w-6"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            navigator.clipboard.writeText(
                              step.promptTemplate ?? ""
                            )
                            toast.success("Prompt copied")
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {step.tips && step.tips.length > 0 && (
                      <div
                        className={cn(
                          "rounded-lg p-3 border",
                          config.lightBg,
                          config.borderColor
                        )}
                      >
                        <p className="text-xs font-semibold mb-1.5">Tips</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                          {step.tips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Checklist */}
                {step.acceptanceCriteria && step.acceptanceCriteria.length > 0 && (
                  <Collapsible
                    defaultOpen={!!step.acceptanceCriteria?.length}
                    className="mt-4"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Checklist (
                      {Object.values(checkedItems).filter(Boolean).length}/
                      {step.acceptanceCriteria?.length ?? 0}){" "}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 space-y-1.5">
                      {step.acceptanceCriteria.map((criteria, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2.5 py-1 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={!!checkedItems[i]}
                            onChange={() =>
                              setCheckedItems((prev) => ({
                                ...prev,
                                [i]: !prev[i],
                              }))
                            }
                            className="rounded border-gray-300 h-3.5 w-3.5"
                          />
                          <span
                            className={cn(
                              "text-xs",
                              checkedItems[i] &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            {criteria}
                          </span>
                        </label>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Action buttons — only for active step */}
                {!isViewingCompletedStep && (
                  <div className="mt-8 border-t pt-4 flex items-center gap-3">
                    {currentStepIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToPreviousStep}
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Previous
                      </Button>
                    )}
                    <div className="flex-1" />
                    {!step.required && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipStep}
                      >
                        <SkipForward className="mr-1.5 h-3.5 w-3.5" /> Skip
                      </Button>
                    )}
                    <Button size="sm" onClick={handleCompleteStep}>
                      {isLastStep ? "Complete Workflow" : "Complete Step"}
                      <Check className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </Fragment>
            )
          })()}
        </div>
      </div>
    </Fragment>
  )
}
