"use client"

import { useState, Fragment } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Copy,
  Rocket,
  Check,
  ExternalLink,
  Eye,
  Play,
} from "lucide-react"
import { getWorkflowTemplateById } from "@/lib/mock-data/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import { aiToolsWhitelist } from "@/lib/ai-tools-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function WorkflowTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : params.id?.[0]
  const template = id ? getWorkflowTemplateById(id) : null
  const [selectedStepIndex, setSelectedStepIndex] = useState(0)

  if (!id || !template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-sm font-medium text-muted-foreground">Template not found</p>
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workflows
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/workflows"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <h1 className="text-sm font-semibold">{template.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[9px] capitalize">
                  {template.category}
                </Badge>
                {template.isSystem ? (
                  <Badge className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    System
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px]">
                    Custom
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {template.steps.length} steps · ~{template.estimatedTotalMinutes ?? 0} min
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!template.isSystem && (
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <Link href={`/workflows/${template.id}/edit`}>Edit</Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => toast.success("Template duplicated")}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => router.push(`/tasks?newTask=true&workflow=${template.id}`)}
          >
            <Rocket className="mr-1.5 h-3.5 w-3.5" /> Use This Workflow
          </Button>
        </div>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — flow canvas */}
        <div className="w-[420px] shrink-0 border-r bg-muted/20 overflow-y-auto">
          <div className="flex flex-col items-center py-8 px-6">
            {/* Starter badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Play className="h-3 w-3 text-emerald-600 dark:text-emerald-400 fill-current" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Workflow Start
              </span>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Step cards */}
            {template.steps.map((step, index) => {
              const config = STEP_TYPE_CONFIG[step.stepType]
              const Icon = config.icon
              const isSelected = selectedStepIndex === index
              const isLast = index === template.steps.length - 1
              const tools = (step.recommendedToolIds || [])
                .map((tid) => aiToolsWhitelist.find((t) => t.id === tid))
                .filter((t): t is NonNullable<typeof t> => Boolean(t))

              return (
                <Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedStepIndex(index)}
                    className={cn(
                      "w-full max-w-[340px] rounded-xl border-2 p-4 text-left transition-all duration-150",
                      isSelected
                        ? cn("border-current shadow-md bg-card", config.textColor)
                        : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                          isSelected
                            ? cn(config.color, "text-white")
                            : cn(config.lightBg, "border", config.borderColor)
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isSelected ? "text-white" : config.textColor
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Step {index + 1}
                          </span>
                          {step.estimatedMinutes && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {step.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate mt-0.5">{step.name}</p>
                      </div>
                      {tools.length > 0 && (
                        <div className="flex -space-x-1 shrink-0">
                          {tools.slice(0, 2).map((tool) => (
                            <span
                              key={tool.id}
                              className="text-base"
                              title={tool.name}
                            >
                              {tool.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>

                  {!isLast && <div className="w-px h-6 bg-border" />}
                </Fragment>
              )
            })}

            {/* End connector + completion badge */}
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2 mt-0">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Complete
              </span>
            </div>

            <div className="h-8" />
          </div>
        </div>

        {/* Right panel — step detail */}
        <div className="flex-1 overflow-y-auto">
          {(() => {
            const step = template.steps[selectedStepIndex]
            if (!step) return null
            const config = STEP_TYPE_CONFIG[step.stepType]
            const Icon = config.icon
            const tools = (step.recommendedToolIds || [])
              .map((tid) => aiToolsWhitelist.find((t) => t.id === tid))
              .filter((t): t is NonNullable<typeof t> => Boolean(t))

            return (
              <div className="p-6 max-w-2xl">
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
                      {step.estimatedMinutes && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> ~{step.estimatedMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-3">{step.description}</p>
                )}

                <Separator className="my-6" />

                {/* Recommended Tools */}
                {tools.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Recommended Tools
                    </h3>
                    <div className="space-y-2">
                      {tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-blue-400/50 transition-colors"
                        >
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{tool.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {tool.category}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            {tool.trackingLevel}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 shrink-0"
                            onClick={() => {
                              window.open(tool.baseUrl, "_blank")
                              toast.success(`Launched ${tool.name}`)
                            }}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" /> Open
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted/30">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        Browser extension captures prompts, generations, and downloads
                        automatically
                      </span>
                    </div>
                  </div>
                )}

                {/* Prompt Template */}
                {step.promptTemplate && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Prompt Template
                    </h3>
                    <div className="relative group">
                      <div className="bg-muted/40 rounded-lg p-4 border border-border/50 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                        {step.promptTemplate}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-7 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(step.promptTemplate ?? "")
                          toast.success("Copied")
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" /> Copy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Tips
                    </h3>
                    <div
                      className={cn(
                        "rounded-lg p-4 border",
                        config.lightBg,
                        config.borderColor
                      )}
                    >
                      <ul className="space-y-2">
                        {step.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Acceptance Criteria */}
                {step.acceptanceCriteria && step.acceptanceCriteria.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Done When
                    </h3>
                    <div className="space-y-2">
                      {step.acceptanceCriteria.map((c, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="h-4 w-4 rounded border border-border flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5 text-muted-foreground/40" />
                          </div>
                          <span className="text-xs">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step navigation */}
                <Separator className="my-6" />
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    disabled={selectedStepIndex === 0}
                    onClick={() => setSelectedStepIndex((prev) => prev - 1)}
                  >
                    ← Previous Step
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    disabled={selectedStepIndex === template.steps.length - 1}
                    onClick={() => setSelectedStepIndex((prev) => prev + 1)}
                  >
                    Next Step →
                  </Button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
