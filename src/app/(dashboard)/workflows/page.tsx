"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer } from "@/components/layout/PageContainer"
import { Search, Plus, Clock, BarChart3, GitBranch } from "lucide-react"
import { getWorkflowTemplates } from "@/lib/mock-data/workflows"
import { STEP_TYPE_CONFIG } from "@/lib/workflow-step-config"
import type { WorkflowTemplate } from "@/types/workflows"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const CATEGORY_OPTIONS = ["all", "video", "image", "audio", "mixed", "custom"] as const

function categoryLabel(value: string): string {
  return value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)
}

export default function WorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const templates = getWorkflowTemplates()

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return templates.filter((template) => {
      if (q) {
        const nameMatch = template.name.toLowerCase().includes(q)
        const descMatch = template.description?.toLowerCase().includes(q)
        const tagMatch = template.tags?.some((t) => t.toLowerCase().includes(q))
        if (!nameMatch && !descMatch && !tagMatch) return false
      }
      if (categoryFilter === "custom") {
        return !template.isSystem
      }
      if (categoryFilter !== "all" && template.category !== categoryFilter) return false
      return true
    })
  }, [templates, searchQuery, categoryFilter])

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse templates or create your own creative workflows
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/workflows/new">
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mt-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 w-64 text-sm"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          {CATEGORY_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md transition-colors",
                categoryFilter === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {categoryLabel(value)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No workflows found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-all cursor-pointer group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <span className="text-sm font-semibold">{template.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {template.description}
                </p>
                <div className="mt-3 flex items-center gap-1">
                  {template.steps.map((step) => (
                    <span
                      key={step.id}
                      className={cn(
                        "h-2.5 w-2.5 rounded-full shrink-0",
                        STEP_TYPE_CONFIG[step.stepType].color
                      )}
                    />
                  ))}
                  <span className="text-[11px] text-muted-foreground ml-2">
                    {template.steps.length} steps
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ~{template.estimatedTotalMinutes ?? 0} min
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> Used {template.usageCount ?? 0} times
                  </span>
                  {template.isSystem ? (
                    <Badge
                      className="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      variant="outline"
                    >
                      System
                    </Badge>
                  ) : (
                    <Badge className="text-[9px]" variant="outline">
                      Custom
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7" asChild>
                    <Link href={`/workflows/${template.id}`}>View Details</Link>
                  </Button>
                  <Button size="sm" className="flex-1 text-xs h-7" asChild>
                    <Link href={`/tasks?create=1&workflow=${template.id}`}>
                      Create Task
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  )
}
