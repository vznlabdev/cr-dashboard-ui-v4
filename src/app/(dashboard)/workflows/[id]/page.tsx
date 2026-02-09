"use client"

import { useState, Fragment } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Clock,
  BarChart3,
  Copy,
  ChevronDown,
  GitBranch,
  Rocket,
  Check,
  ExternalLink,
} from "lucide-react"
import { getWorkflowTemplateById } from "@/lib/mock-data/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import { aiToolsWhitelist } from "@/lib/ai-tools-data"
import type { WorkflowTemplate } from "@/types/workflows"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/PageContainer"

export default function WorkflowTemplatePage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : params.id?.[0]
  const template = id ? getWorkflowTemplateById(id) : null

  if (!template) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm font-medium text-muted-foreground">Template not found</p>
          <Link
            href="/workflows"
            className="mt-3 text-sm text-primary hover:underline"
          >
            Back to Workflows
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Link
        href="/workflows"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Workflows
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{template.icon}</span>
          <div>
            <h1 className="text-xl font-bold">{template.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] capitalize">
                {template.category}
              </Badge>
              {template.isSystem ? (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  System
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Custom
                </Badge>
              )}
              {template.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => toast.success("Template ready to assign")}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Use Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Template duplicated")}
          >
            Duplicate
          </Button>
        </div>
      </div>

      {template.description && (
        <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
      )}

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
        <span className="inline-flex items-center gap-1">
          <GitBranch className="h-4 w-4" /> {template.steps.length} steps
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" /> ~{template.estimatedTotalMinutes ?? 0} min
        </span>
        <span className="inline-flex items-center gap-1">
          <BarChart3 className="h-4 w-4" /> Used {template.usageCount ?? 0} times
        </span>
        <span>Created by {template.createdBy}</span>
      </div>

      {/* Visual step flow */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-4">
        Workflow
      </h2>
      <div className="flex items-center overflow-x-auto pb-2 gap-0">
        {template.steps.map((step, index) => {
          const config = STEP_TYPE_CONFIG[step.stepType]
          const Icon = config.icon
          return (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border",
                    config.lightBg,
                    config.borderColor
                  )}
                >
                  <Icon className={cn("h-6 w-6", config.textColor)} />
                </div>
                <span className="text-[11px] font-medium text-center max-w-[80px] truncate">
                  {step.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {step.estimatedMinutes ?? 0}min
                </span>
              </div>
              {index < template.steps.length - 1 && (
                <div className="h-px w-8 bg-border shrink-0 mb-8" />
              )}
            </Fragment>
          )
        })}
      </div>

      {/* Step details */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">
        Steps
      </h2>
      <div className="space-y-2">
        {template.steps.map((step) => {
          const config = STEP_TYPE_CONFIG[step.stepType]
          const Icon = config.icon
          const tools = (step.recommendedToolIds || [])
            .map((tid) => aiToolsWhitelist.find((t) => t.id === tid))
            .filter((t): t is NonNullable<typeof t> => Boolean(t))

          return (
            <Collapsible key={step.id} className="border rounded-lg group/collapsible">
              <CollapsibleTrigger className="flex items-center w-full p-3 hover:bg-muted/30 transition-colors data-[state=open]:border-b border-transparent">
                <div
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                    config.lightBg
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.textColor)} />
                </div>
                <div className="flex-1 ml-3 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Step {step.order}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
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
                    {step.required && (
                      <Badge
                        className="text-[9px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                        variant="outline"
                      >
                        Required
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {step.estimatedMinutes ?? 0} min
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform shrink-0 group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-3 space-y-4">
                {step.description && (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                )}

                {tools.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Recommended Tools
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {tools.map((tool) => (
                        <Badge
                          key={tool.id}
                          variant="outline"
                          className="text-xs gap-1.5 py-1"
                        >
                          <span>{tool.icon}</span> {tool.name}
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {step.promptTemplate && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Prompt Template
                    </p>
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-3 text-xs font-mono whitespace-pre-wrap pr-10">
                        {step.promptTemplate}
                      </pre>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-1.5 right-1.5 h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigator.clipboard.writeText(step.promptTemplate ?? "")
                          toast.success("Copied")
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
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
                    <p className="text-xs font-semibold mb-1">Tips</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {step.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {step.acceptanceCriteria && step.acceptanceCriteria.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Done When
                    </p>
                    <div className="space-y-1">
                      {step.acceptanceCriteria.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </PageContainer>
  )
}
