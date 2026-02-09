"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Copy,
  ChevronDown,
  Rocket,
  Check,
  ExternalLink,
  Zap,
  Users,
} from "lucide-react"
import { getWorkflowTemplateById, addWorkflowTemplate } from "@/lib/mock-data/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import { aiToolsWhitelist } from "@/lib/ai-tools-data"
import type { WorkflowTemplate } from "@/types/workflows"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/PageContainer"

export default function WorkflowTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : params.id?.[0]
  const template = id ? getWorkflowTemplateById(id) : null
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  function duplicateAndEdit() {
    if (!template) return
    const now = new Date().toISOString()
    const copy: WorkflowTemplate = {
      ...JSON.parse(JSON.stringify(template)),
      id: `wf-custom-${Date.now()}`,
      name: `Copy of ${template.name}`,
      createdBy: "Me",
      createdAt: now,
      updatedAt: now,
      isSystem: false,
      isPublished: false,
    }
    addWorkflowTemplate(copy)
    toast.success("Duplicated — now editing your copy")
    router.push(`/workflows/${copy.id}/edit`)
  }

  if (!template) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm font-medium text-muted-foreground">Template not found</p>
          <Link
            href="/workflows"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-3"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workflows
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Link
        href="/workflows"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Workflows
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{template.icon}</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                {template.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="capitalize">
                  {template.category}
                </Badge>
                {template.isSystem ? (
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    System Template
                  </Badge>
                ) : (
                  <Badge variant="outline">Custom</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {template.isSystem ? (
              <Button
                size="sm"
                variant="outline"
                onClick={duplicateAndEdit}
              >
                Edit (Duplicate First)
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/workflows/${template.id}/edit`}>
                  Edit Workflow
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              className="shadow-md"
              onClick={() =>
                toast.success("Template ready — assign to a task to begin")
              }
            >
              <Rocket className="mr-2 h-4 w-4" /> Use This Workflow
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={duplicateAndEdit}
            >
              Duplicate
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{template.steps.length}</p>
              <p className="text-[11px] text-muted-foreground">Steps</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-lg font-bold">
                ~{template.estimatedTotalMinutes ?? 0}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  min
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">Estimated</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{template.usageCount ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">Times used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-6">How it works</h2>

        <div className="relative">
          {template.steps.map((step, index) => {
            const config = STEP_TYPE_CONFIG[step.stepType]
            const Icon = config.icon
            const isExpanded = expandedStep === index
            const isLast = index === template.steps.length - 1
            const tools = (step.recommendedToolIds || [])
              .map((id) => aiToolsWhitelist.find((t) => t.id === id))
              .filter(Boolean)

            return (
              <div key={step.id} className="relative flex gap-6">
                {/* Timeline line + node */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedStep(isExpanded ? null : index)
                    }
                    className={cn(
                      "relative z-10 h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all duration-200 shrink-0 cursor-pointer",
                      isExpanded
                        ? cn(
                            config.color,
                            "border-transparent text-white shadow-lg scale-110"
                          )
                        : cn(
                            "bg-card border-border hover:border-current hover:shadow-md",
                            config.textColor
                          )
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-[24px]",
                        isExpanded
                          ? "bg-gradient-to-b from-border to-transparent"
                          : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Step content */}
                <div
                  className={cn("flex-1 pb-8", isLast && "pb-0")}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedStep(isExpanded ? null : index)
                    }
                    className="w-full text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold group-hover:text-foreground transition-colors">
                            {step.name}
                          </h3>
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
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ~{step.estimatedMinutes ?? 0} min
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200 ml-auto",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {tools.length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Recommended Tools
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {tools.map((tool) => (
                              <button
                                key={tool!.id}
                                type="button"
                                onClick={() => {
                                  window.open(tool!.baseUrl, "_blank")
                                  toast.success(`Launched ${tool!.name}`)
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/50 hover:border-blue-400 transition-all group/tool"
                              >
                                <span className="text-lg">{tool!.icon}</span>
                                <div className="text-left">
                                  <p className="text-xs font-medium">
                                    {tool!.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {tool!.category}
                                  </p>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground ml-2 opacity-0 group-hover/tool:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.promptTemplate && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Prompt Template
                          </p>
                          <div className="relative group/prompt">
                            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                              <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground/80">
                                {step.promptTemplate}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute top-2 right-2 h-7 text-[10px] opacity-0 group-hover/prompt:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(
                                  step.promptTemplate ?? ""
                                )
                                toast.success("Prompt copied to clipboard")
                              }}
                            >
                              <Copy className="mr-1 h-3 w-3" /> Copy
                            </Button>
                          </div>
                        </div>
                      )}

                      {step.tips && step.tips.length > 0 && (
                        <div
                          className={cn(
                            "rounded-lg p-4 border",
                            config.lightBg,
                            config.borderColor
                          )}
                        >
                          <p className="text-xs font-semibold mb-2">💡 Tips</p>
                          <ul className="space-y-1.5">
                            {step.tips.map((tip, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-muted-foreground"
                              >
                                <span className="mt-1 h-1 w-1 rounded-full bg-current shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.acceptanceCriteria &&
                        step.acceptanceCriteria.length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              ✓ Done when
                            </p>
                            <div className="space-y-1.5">
                              {step.acceptanceCriteria.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <div className="h-4 w-4 rounded border border-border flex items-center justify-center shrink-0">
                                    <Check className="h-2.5 w-2.5 text-muted-foreground/50" />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {c}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 mb-8 text-center">
        <Separator className="mb-8" />
        <p className="text-sm text-muted-foreground mb-3">
          Ready to start creating?
        </p>
        <Button
          size="lg"
          onClick={() =>
            toast.success("Template ready — assign to a task to begin")
          }
        >
          <Rocket className="mr-2 h-4 w-4" /> Use This Workflow
        </Button>
      </div>
    </PageContainer>
  )
}
