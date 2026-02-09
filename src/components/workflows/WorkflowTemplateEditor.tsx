"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  Check,
  X,
} from "lucide-react"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import { aiToolsWhitelist } from "@/lib/ai-tools-data"
import type {
  WorkflowTemplate,
  WorkflowStepConfig,
  WorkflowStepType,
} from "@/types/workflows"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type EditorMode = "edit" | "create"

interface WorkflowTemplateEditorProps {
  mode: EditorMode
  initialTemplate: WorkflowTemplate
  templateId: string | null
  onSave: (template: WorkflowTemplate) => void
}

export function WorkflowTemplateEditor({
  mode,
  initialTemplate,
  templateId,
  onSave,
}: WorkflowTemplateEditorProps) {
  const [name, setName] = useState(initialTemplate.name)
  const [description, setDescription] = useState(initialTemplate.description ?? "")
  const [category, setCategory] = useState<WorkflowTemplate["category"]>(
    initialTemplate.category
  )
  const [icon, setIcon] = useState(initialTemplate.icon)
  const [steps, setSteps] = useState<WorkflowStepConfig[]>(() =>
    JSON.parse(JSON.stringify(initialTemplate.steps))
  )
  const [expandedStep, setExpandedStep] = useState<number | null>(0)
  const [hasChanges, setHasChanges] = useState(false)

  const updateStep = useCallback(
    (index: number, field: keyof WorkflowStepConfig, value: unknown) => {
      setSteps((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
      setHasChanges(true)
    },
    []
  )

  const moveStep = useCallback((index: number, direction: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev]
      const newIndex = index + direction
      const [moved] = next.splice(index, 1)
      next.splice(newIndex, 0, moved)
      next.forEach((s, i) => {
        s.order = i + 1
      })
      return next
    })
    setExpandedStep(index + direction)
    setHasChanges(true)
  }, [])

  const removeStep = useCallback((index: number) => {
    if (steps.length <= 1) {
      toast.error("Workflow must have at least one step")
      return
    }
    setSteps((prev) => {
      const next = prev.filter((_, i) => i !== index)
      next.forEach((s, i) => {
        s.order = i + 1
      })
      return next
    })
    setExpandedStep(null)
    setHasChanges(true)
    toast.success("Step removed")
  }, [steps.length])

  const addStep = useCallback((stepType: WorkflowStepType) => {
    const config = STEP_TYPE_CONFIG[stepType]
    const newStep: WorkflowStepConfig = {
      id: `step-new-${Date.now()}`,
      name: config.label,
      stepType,
      order: steps.length + 1,
      required: true,
      estimatedMinutes: config.defaultEstimate,
      promptTemplate: "",
      tips: [],
      acceptanceCriteria: [],
      recommendedToolIds: [],
    }
    setSteps((prev) => [...prev, newStep])
    setExpandedStep(steps.length)
    setHasChanges(true)
    toast.success(`${config.label} step added`)
  }, [steps.length])

  const handleSave = useCallback(() => {
    const now = new Date().toISOString()
    const stepsWithOrder = steps.map((s, i) => ({ ...s, order: i + 1 }))
    if (mode === "create") {
      const created: WorkflowTemplate = {
        id: `wf-custom-${Date.now()}`,
        name: name.trim() || "Untitled Workflow",
        description: description.trim() || undefined,
        category,
        icon: icon || "📋",
        steps: stepsWithOrder,
        createdBy: "Me",
        createdAt: now,
        updatedAt: now,
        isSystem: false,
        isPublished: false,
      }
      onSave(created)
    } else {
      const template: WorkflowTemplate = {
        ...initialTemplate,
        name: name.trim() || initialTemplate.name,
        description: description.trim() || undefined,
        category,
        icon: icon || initialTemplate.icon,
        steps: stepsWithOrder,
        updatedAt: now,
      }
      onSave(template)
    }
    setHasChanges(false)
  }, [
    mode,
    initialTemplate,
    name,
    description,
    category,
    icon,
    steps,
    onSave,
  ])

  const approvedTools = aiToolsWhitelist.filter((t) => t.approved && t.active)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            {templateId ? (
              <Link
                href={`/workflows/${templateId}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {initialTemplate.name}
              </Link>
            ) : (
              <Link
                href="/workflows"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Workflows
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mode === "edit" && templateId && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/workflows/${templateId}`}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                </Link>
              </Button>
            )}
            <Button
              size="sm"
              disabled={!hasChanges}
              onClick={handleSave}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {mode === "create" ? "Create Workflow" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        {/* Template info */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-5xl hover:scale-110 transition-transform cursor-pointer"
            onClick={() => toast.info("Emoji picker coming soon")}
            title="Change icon"
          >
            {icon}
          </button>
          <div className="flex-1 min-w-0">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setHasChanges(true)
              }}
              className="text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40"
              placeholder="Workflow name..."
            />
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setHasChanges(true)
              }}
              className="mt-1 border-none shadow-none px-0 resize-none text-sm text-muted-foreground focus-visible:ring-0 placeholder:text-muted-foreground/30 min-h-[24px]"
              placeholder="Add a description..."
              rows={1}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-muted-foreground">Category:</span>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v as WorkflowTemplate["category"])
              setHasChanges(true)
            }}
          >
            <SelectTrigger className="w-32 h-7 text-xs" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-8" />

        {/* Steps editor */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Steps</h2>
          <span className="text-xs text-muted-foreground">
            {steps.length} steps • ~
            {steps.reduce((sum, s) => sum + (s.estimatedMinutes || 0), 0)} min
            total
          </span>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const config = STEP_TYPE_CONFIG[step.stepType]
            const Icon = config.icon
            const isExpanded = expandedStep === index

            return (
              <div
                key={step.id}
                className={cn(
                  "border rounded-xl transition-all",
                  isExpanded ? "shadow-sm" : "hover:border-foreground/20"
                )}
              >
                <div className="w-full flex items-center gap-3 p-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedStep(isExpanded ? null : index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setExpandedStep(isExpanded ? null : index)
                      }
                    }}
                    className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
                        config.lightBg,
                        config.borderColor
                      )}
                    >
                      <Icon className={cn("h-4 w-4", config.textColor)} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          Step {index + 1}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {step.name || "Untitled Step"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px]",
                            config.textColor,
                            config.lightBg,
                            config.borderColor
                          )}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {step.estimatedMinutes ?? 0} min
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === 0}
                      onClick={() => moveStep(index, -1)}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === steps.length - 1}
                      onClick={() => moveStep(index, 1)}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-0 space-y-4 border-t"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-12 gap-3 pt-4">
                      <div className="col-span-5">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                          Step Name
                        </label>
                        <Input
                          value={step.name}
                          onChange={(e) =>
                            updateStep(index, "name", e.target.value)
                          }
                          className="text-sm h-8"
                          placeholder="Step name..."
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                          Type
                        </label>
                        <Select
                          value={step.stepType}
                          onValueChange={(v) =>
                            updateStep(index, "stepType", v as WorkflowStepType)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STEP_TYPE_CONFIG).map(
                              ([key, cfg]) => (
                                <SelectItem key={key} value={key}>
                                  <span className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "h-2 w-2 rounded-full",
                                        cfg.color
                                      )}
                                    />
                                    {cfg.label}
                                  </span>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                          Est. Time
                        </label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={step.estimatedMinutes ?? ""}
                            onChange={(e) =>
                              updateStep(
                                index,
                                "estimatedMinutes",
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="text-sm h-8 w-16"
                            min={1}
                          />
                          <span className="text-xs text-muted-foreground">
                            min
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        Prompt Template
                      </label>
                      <Textarea
                        value={step.promptTemplate ?? ""}
                        onChange={(e) =>
                          updateStep(index, "promptTemplate", e.target.value)
                        }
                        className="text-xs font-mono min-h-[60px] resize-y"
                        placeholder="Enter the prompt template creators will use for this step..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        Tips
                      </label>
                      <div className="space-y-1.5">
                        {(step.tips || []).map((tip, tipIndex) => (
                          <div
                            key={tipIndex}
                            className="flex items-center gap-2"
                          >
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              💡
                            </span>
                            <Input
                              value={tip}
                              onChange={(e) => {
                                const newTips = [...(step.tips || [])]
                                newTips[tipIndex] = e.target.value
                                updateStep(index, "tips", newTips)
                              }}
                              className="text-xs h-7 flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => {
                                const newTips = (step.tips || []).filter(
                                  (_, i) => i !== tipIndex
                                )
                                updateStep(index, "tips", newTips)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-muted-foreground"
                          onClick={() => {
                            updateStep(index, "tips", [
                              ...(step.tips || []),
                              "",
                            ])
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add tip
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        Acceptance Criteria
                      </label>
                      <div className="space-y-1.5">
                        {(step.acceptanceCriteria || []).map(
                          (criteria, cIndex) => (
                            <div
                              key={cIndex}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                              <Input
                                value={criteria}
                                onChange={(e) => {
                                  const newCriteria = [
                                    ...(step.acceptanceCriteria || []),
                                  ]
                                  newCriteria[cIndex] = e.target.value
                                  updateStep(
                                    index,
                                    "acceptanceCriteria",
                                    newCriteria
                                  )
                                }}
                                className="text-xs h-7 flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => {
                                  const newCriteria = (
                                    step.acceptanceCriteria || []
                                  ).filter((_, i) => i !== cIndex)
                                  updateStep(
                                    index,
                                    "acceptanceCriteria",
                                    newCriteria
                                  )
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-muted-foreground"
                          onClick={() => {
                            updateStep(index, "acceptanceCriteria", [
                              ...(step.acceptanceCriteria || []),
                              "",
                            ])
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add criteria
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        Recommended Tools
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {approvedTools.map((tool) => {
                          const isSelected = (
                            step.recommendedToolIds || []
                          ).includes(tool.id)
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => {
                                const current =
                                  step.recommendedToolIds || []
                                const updated = isSelected
                                  ? current.filter((id) => id !== tool.id)
                                  : [...current, tool.id]
                                updateStep(
                                  index,
                                  "recommendedToolIds",
                                  updated
                                )
                              }}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all",
                                isSelected
                                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                  : "border-border hover:border-foreground/30 text-muted-foreground"
                              )}
                            >
                              <span>{tool.icon}</span>
                              <span>{tool.name}</span>
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add step */}
        <div className="mt-4">
          <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-foreground/30 transition-colors">
            <p className="text-xs text-muted-foreground mb-2">
              Add a new step
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {Object.entries(STEP_TYPE_CONFIG).map(([key, cfg]) => {
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 gap-1.5"
                    onClick={() => addStep(key as WorkflowStepType)}
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", cfg.color)}
                    />
                    {cfg.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
