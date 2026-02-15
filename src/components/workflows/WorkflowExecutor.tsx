"use client"

import { useState, Fragment, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Lock,
  Rocket,
  SkipForward,
  ArrowLeft,
  Eye,
  Download,
  Upload,
  Play,
  FileText,
  Sparkles,
  ChevronRight,
  Zap,
  X,
} from "lucide-react"
import type {
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowStepConfig,
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

type StepOutputRecord = {
  thumbnailUrl: string
  fileName: string
  toolUsed: string
  capturedPrompts: number
  capturedGenerations: number
  capturedDownloads: number
}

export function WorkflowExecutor({
  template,
  instance,
  onUpdateInstance,
}: WorkflowExecutorProps) {
  const [localInstance, setLocalInstance] = useState<WorkflowInstance>(instance)
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(instance.currentStepIndex)
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: { [key: number]: boolean } }>({})
  const [stepOutputs, setStepOutputs] = useState<{ [key: string]: StepOutputRecord }>({})
  const [promptTexts, setPromptTexts] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    setLocalInstance(instance)
    setSelectedStepIndex(instance.currentStepIndex)
  }, [instance])

  useEffect(() => {
    const initial: { [key: string]: string } = {}
    template.steps.forEach((step) => {
      if (step.promptTemplate != null) {
        initial[step.id] = step.promptTemplate
      }
    })
    setPromptTexts((prev) => ({ ...initial, ...prev }))
  }, [template.id])

  const completedCount = localInstance.stepStatuses.filter(
    (s) => s.status === "completed" || s.status === "skipped"
  ).length
  const remainingMinutes = template.steps.reduce((sum, step, i) => {
    const status = localInstance.stepStatuses[i]?.status
    if (status === "completed" || status === "skipped") return sum
    return sum + (step.estimatedMinutes ?? 0)
  }, 0)
  const isWorkflowComplete = localInstance.status === "completed"

  function handleCompleteStep() {
    const currentStepIndex = localInstance.currentStepIndex
    const stepStatus = localInstance.stepStatuses[currentStepIndex]
    if (!stepStatus) return

    const next: WorkflowInstance = {
      ...localInstance,
      stepStatuses: localInstance.stepStatuses.map((s) => ({ ...s })),
    }
    const nextStatus = next.stepStatuses[currentStepIndex]
    nextStatus.status = "completed"
    nextStatus.completedAt = new Date().toISOString()
    const output = stepOutputs[template.steps[currentStepIndex]?.id]
    if (output?.toolUsed) nextStatus.toolUsed = output.toolUsed

    if (currentStepIndex < template.steps.length - 1) {
      next.currentStepIndex = currentStepIndex + 1
      const nextStepStatus = next.stepStatuses[next.currentStepIndex]
      if (nextStepStatus) {
        nextStepStatus.status = "active"
        nextStepStatus.startedAt = new Date().toISOString()
      }
      setSelectedStepIndex(next.currentStepIndex)
    } else {
      next.status = "completed"
      next.completedAt = new Date().toISOString()
    }

    setLocalInstance(next)
    onUpdateInstance(next)
    toast.success(
      currentStepIndex === template.steps.length - 1
        ? "Workflow completed!"
        : "Step completed. Next step ready."
    )
  }

  function handleSkipStep() {
    const currentStepIndex = localInstance.currentStepIndex
    const stepStatus = localInstance.stepStatuses[currentStepIndex]
    if (!stepStatus) return

    const next: WorkflowInstance = {
      ...localInstance,
      stepStatuses: localInstance.stepStatuses.map((s) => ({ ...s })),
    }
    const nextStatus = next.stepStatuses[currentStepIndex]
    nextStatus.status = "skipped"
    nextStatus.completedAt = new Date().toISOString()

    if (currentStepIndex < template.steps.length - 1) {
      next.currentStepIndex = currentStepIndex + 1
      const nextStepStatus = next.stepStatuses[next.currentStepIndex]
      if (nextStepStatus) {
        nextStepStatus.status = "active"
        nextStepStatus.startedAt = new Date().toISOString()
      }
      setSelectedStepIndex(next.currentStepIndex)
    } else {
      next.status = "completed"
      next.completedAt = new Date().toISOString()
    }

    setLocalInstance(next)
    onUpdateInstance(next)
    toast.success("Step skipped.")
  }

  if (isWorkflowComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
          <Check className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold">Workflow Complete</h2>
        <p className="text-sm text-muted-foreground mt-2">
          All {template.steps.length} steps finished · {completedCount} completed
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {localInstance.completedAt
            ? new Date(localInstance.completedAt).toLocaleString()
            : ""}
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => toast.info("Evidence export coming soon")}>
            <Download className="mr-2 h-4 w-4" /> Export Evidence
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ===== LEFT PANEL — LIVE FLOW ===== */}
      <div className="w-[380px] shrink-0 border-r bg-muted/20 overflow-y-auto">
        <div className="flex flex-col items-center py-6 px-4">
          {/* Progress summary */}
          <div className="w-full max-w-[320px] mb-6 px-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>
                {completedCount} of {template.steps.length} complete
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> ~{remainingMinutes}m left
              </span>
            </div>
            <Progress
              value={template.steps.length ? (completedCount / template.steps.length) * 100 : 0}
              className="h-1.5"
            />
          </div>

          {/* Flow start */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Play className="h-2.5 w-2.5 text-white fill-current" />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
              Start
            </span>
          </div>
          <div className="w-px h-4 bg-border" />

          {/* Step cards — LIVE status */}
          {template.steps.map((step, index) => {
            const config = STEP_TYPE_CONFIG[step.stepType]
            const Icon = config.icon
            const status = localInstance.stepStatuses[index]
            const isSelected = selectedStepIndex === index
            const isCompleted = status?.status === "completed" || status?.status === "skipped"
            const isActive = status?.status === "active"
            const isLocked = status?.status === "locked"
            const isLast = index === template.steps.length - 1
            const hasOutput = !!stepOutputs[step.id]

            return (
              <Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLocked) setSelectedStepIndex(index)
                  }}
                  disabled={isLocked}
                  className={cn(
                    "w-full max-w-[320px] rounded-xl border-2 p-3.5 text-left transition-all duration-150 relative",
                    isLocked && "opacity-40 cursor-not-allowed",
                    isSelected && !isLocked
                      ? cn(
                          "shadow-md bg-card",
                          isCompleted ? "border-emerald-400" : "border-blue-400"
                        )
                      : "border-border bg-card hover:shadow-sm",
                    !isSelected && isCompleted && "border-emerald-200 dark:border-emerald-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Status circle */}
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? cn(config.color, "text-white")
                            : isLocked
                              ? "bg-muted border border-border"
                              : cn(config.lightBg, "border", config.borderColor)
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Icon
                          className={cn("h-4 w-4", isActive ? "text-white" : config.textColor)}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Step {index + 1}
                        </span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isLocked && "text-muted-foreground"
                        )}
                      >
                        {step.name}
                      </p>
                    </div>

                    {/* Output indicator */}
                    {hasOutput && (
                      <div
                        className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0"
                        title="Output uploaded"
                      >
                        <FileText className="h-3 w-3 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  {/* Completed timestamp */}
                  {isCompleted && status?.completedAt && (
                    <p className="text-[9px] text-muted-foreground mt-1.5 ml-12">
                      Completed{" "}
                      {new Date(status.completedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </button>

                {!isLast && (
                  <div
                    className={cn(
                      "w-px h-4",
                      isCompleted ? "bg-emerald-300 dark:bg-emerald-700" : "bg-border"
                    )}
                  />
                )}
              </Fragment>
            )
          })}

          {/* Flow end */}
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 mt-0">
            <div
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center",
                isWorkflowComplete ? "bg-emerald-500" : "bg-muted border border-border"
              )}
            >
              <Check
                className={cn(
                  "h-2.5 w-2.5",
                  isWorkflowComplete ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
              {isWorkflowComplete ? "Done!" : "Complete"}
            </span>
          </div>

          <div className="h-8" />
        </div>
      </div>

      {/* ===== RIGHT PANEL — ACTIVE STEP ===== */}
      <div className="flex-1 overflow-y-auto">
        {(() => {
          const step = template.steps[selectedStepIndex]
          if (!step) return null
          const config = STEP_TYPE_CONFIG[step.stepType]
          const Icon = config.icon
          const status = localInstance.stepStatuses[selectedStepIndex]
          const isCompleted = status?.status === "completed" || status?.status === "skipped"
          const isActive = status?.status === "active"
          const isLocked = status?.status === "locked"
          const tools = (step.recommendedToolIds || [])
            .map((id) => aiToolsWhitelist.find((t) => t.id === id))
            .filter((t): t is NonNullable<typeof t> => Boolean(t))
          const stepChecks = checkedItems[step.id] || {}

          return (
            <div className="p-6 max-w-2xl">
              {/* Locked state */}
              {isLocked && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 mb-4">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Complete the previous step to unlock this one
                  </span>
                </div>
              )}

              {/* Completed banner */}
              {isCompleted && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 mb-4">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">
                    Completed{" "}
                    {status?.completedAt
                      ? new Date(status.completedAt).toLocaleString()
                      : ""}
                  </span>
                </div>
              )}

              {/* Step header */}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                Step {selectedStepIndex + 1} of {template.steps.length}
              </div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center border",
                    config.lightBg,
                    config.borderColor
                  )}
                >
                  <Icon className={cn("h-5 w-5", config.textColor)} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{step.name}</h2>
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
                </div>
              </div>

              <Separator className="my-5" />

              {/* How it works mini-stepper (only for active step) */}
              {isActive && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30 mb-5">
                  {[
                    { num: "1", label: "Launch tool", color: "bg-blue-500" },
                    { num: "2", label: "Create content", color: "bg-purple-500" },
                    { num: "3", label: "Upload output", color: "bg-emerald-500" },
                    { num: "4", label: "Complete", color: "bg-amber-500" },
                  ].map((item, i) => (
                    <Fragment key={i}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-5 w-5 rounded-full text-white flex items-center justify-center text-[9px] font-bold",
                            item.color
                          )}
                        >
                          {item.num}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                      {i < 3 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </Fragment>
                  ))}
                </div>
              )}

              {/* Tools */}
              {tools.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Launch Tool
                  </h3>
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          window.open(tool.baseUrl, "_blank")
                          toast.success(
                            `Launched ${tool.name} — extension tracking active`
                          )
                        }}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        <span className="text-3xl">{tool.icon}</span>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold group-hover:text-blue-600 transition-colors">
                            {tool.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {tool.category} · {tool.trackingLevel}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Launch <ExternalLink className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">
                      Extension will track prompts, generations, and downloads
                    </span>
                  </div>
                </div>
              )}

              {/* Prompt guide */}
              {step.promptTemplate && (
                <div className="mb-5">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Prompt
                  </h3>
                  <div className="relative group">
                    <Textarea
                      className="font-mono text-xs min-h-[80px] resize-y bg-muted/30"
                      value={promptTexts[step.id] ?? step.promptTemplate}
                      onChange={(e) =>
                        setPromptTexts((prev) => ({ ...prev, [step.id]: e.target.value }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 h-7 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          promptTexts[step.id] ?? step.promptTemplate ?? ""
                        )
                        toast.success("Copied")
                      }}
                    >
                      <Copy className="mr-1 h-3 w-3" /> Copy
                    </Button>
                  </div>
                  {step.tips && step.tips.length > 0 && (
                    <div
                      className={cn(
                        "rounded-lg p-3 border mt-2",
                        config.lightBg,
                        config.borderColor
                      )}
                    >
                      <ul className="space-y-1">
                        {step.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[11px] text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Output (active) */}
              {isActive && (
                <div className="mb-5">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Output
                  </h3>
                  {!stepOutputs[step.id] ? (
                    <button
                      type="button"
                      onClick={() => {
                        const seed = Math.floor(Math.random() * 1000)
                        setStepOutputs((prev) => ({
                          ...prev,
                          [step.id]: {
                            thumbnailUrl: `https://picsum.photos/seed/${seed}/800/500`,
                            fileName: `${step.name
                              .toLowerCase()
                              .replace(/\s+/g, "-")}-output.png`,
                            toolUsed: tools[0]?.name || "AI Tool",
                            capturedPrompts: Math.floor(Math.random() * 5) + 1,
                            capturedGenerations: Math.floor(Math.random() * 10) + 3,
                            capturedDownloads: Math.floor(Math.random() * 3) + 1,
                          },
                        }))
                        toast.success("Asset uploaded")
                      }}
                      className="w-full border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-blue-500 transition-colors" />
                      <p className="text-sm font-medium mt-2">Upload Output</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Drop your generated asset or click to browse
                      </p>
                    </button>
                  ) : (
                    <div className="border rounded-xl overflow-hidden">
                      <div className="relative h-40 bg-muted">
                        <img
                          src={stepOutputs[step.id].thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                          <span className="text-xs text-white font-medium">
                            {stepOutputs[step.id].fileName}
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 text-[10px]"
                            onClick={() => {
                              const next = { ...stepOutputs }
                              delete next[step.id]
                              setStepOutputs(next)
                            }}
                          >
                            Replace
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />{" "}
                          {stepOutputs[step.id].capturedPrompts} prompts
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />{" "}
                          {stepOutputs[step.id].capturedGenerations} generations
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />{" "}
                          {stepOutputs[step.id].capturedDownloads} downloads
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Output (completed, read-only) */}
              {isCompleted && stepOutputs[step.id] && (
                <div className="mb-5">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Output
                  </h3>
                  <div className="border rounded-xl overflow-hidden opacity-80">
                    <div className="relative h-32 bg-muted">
                      <img
                        src={stepOutputs[step.id].thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{stepOutputs[step.id].fileName}</span>
                      <span>· {stepOutputs[step.id].toolUsed}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist */}
              {step.acceptanceCriteria &&
                step.acceptanceCriteria.length > 0 &&
                !isLocked && (
                  <div className="mb-5">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Checklist (
                      {Object.values(stepChecks).filter(Boolean).length}/
                      {step.acceptanceCriteria.length})
                    </h3>
                    <div className="space-y-2">
                      {step.acceptanceCriteria.map((c, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={!!stepChecks[i]}
                            onChange={() =>
                              setCheckedItems((prev) => ({
                                ...prev,
                                [step.id]: {
                                  ...(prev[step.id] || {}),
                                  [i]: !prev[step.id]?.[i],
                                },
                              }))
                            }
                            disabled={isCompleted}
                            className="rounded border-gray-300 h-3.5 w-3.5"
                          />
                          <span
                            className={cn(
                              "text-xs",
                              stepChecks[i] && "line-through text-muted-foreground"
                            )}
                          >
                            {c}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action buttons (active) */}
              {isActive && (
                <>
                  <Separator className="my-5" />
                  <div className="flex items-center gap-3">
                    {selectedStepIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedStepIndex((prev) => prev - 1)}
                      >
                        ← Previous
                      </Button>
                    )}
                    <div className="flex-1" />
                    {!step.required && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSkipStep()}
                      >
                        Skip
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleCompleteStep()}>
                      {selectedStepIndex === template.steps.length - 1
                        ? "Complete Workflow"
                        : "Complete Step"}
                      <Check className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}

              {/* Navigation (completed step) */}
              {isCompleted && !isActive && (
                <>
                  <Separator className="my-5" />
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      disabled={selectedStepIndex === 0}
                      onClick={() => setSelectedStepIndex((prev) => prev - 1)}
                    >
                      ← Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      disabled={selectedStepIndex === template.steps.length - 1}
                      onClick={() => setSelectedStepIndex((prev) => prev + 1)}
                    >
                      Next →
                    </Button>
                  </div>
                </>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
