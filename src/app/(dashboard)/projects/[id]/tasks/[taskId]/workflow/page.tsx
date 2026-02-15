"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { getTaskById } from "@/lib/mock-data/projects-tasks"
import {
  getWorkflowTemplateById,
  createWorkflowInstance,
} from "@/lib/mock-data/workflows"
import { WorkflowExecutor } from "@/components/workflows/WorkflowExecutor"
import { useData } from "@/contexts/data-context"
import type { Task } from "@/types"
import type { WorkflowTemplate, WorkflowInstance } from "@/types/workflows"

export default function TaskWorkflowPage() {
  const params = useParams()
  const taskId = (typeof params.taskId === "string" ? params.taskId : params.taskId?.[0]) ?? ""
  const projectId = (typeof params.id === "string" ? params.id : params.id?.[0]) ?? ""

  const { getProjectById } = useData()
  const project = getProjectById(projectId)

  const [task, setTask] = useState<Task | null>(null)
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null)
  const [instance, setInstance] = useState<WorkflowInstance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadedTask = taskId ? getTaskById(taskId) : undefined
    if (loadedTask) {
      setTask(loadedTask)
      if (loadedTask.workflowTemplateId) {
        const tmpl = getWorkflowTemplateById(loadedTask.workflowTemplateId)
        if (tmpl) {
          setTemplate(tmpl)
          const existing = loadedTask.workflowInstance
          const inst: WorkflowInstance = existing
            ? {
                ...existing,
                stepStatuses: existing.stepStatuses.map((s) => ({ ...s })),
              }
            : createWorkflowInstance(tmpl.id, taskId, projectId)
          inst.status = "in_progress"
          inst.startedAt = inst.startedAt || new Date().toISOString()
          if (inst.stepStatuses[0]) {
            inst.stepStatuses[0].status = "active"
            inst.stepStatuses[0].startedAt =
              inst.stepStatuses[0].startedAt || new Date().toISOString()
          }
          setInstance(inst)
        }
      }
    }
    setLoading(false)
  }, [taskId, projectId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Task not found</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectId}/tasks`}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Back to tasks
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            No workflow template assigned to this task
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/workflows">Browse workflows</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/projects/${projectId}/tasks/${taskId}`}>
                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                Back to task
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-card shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/projects/${projectId}/tasks/${taskId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            href={`/projects/${projectId}/tasks`}
            className="hover:text-foreground transition-colors"
          >
            {project?.name ?? "Project"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/projects/${projectId}/tasks/${taskId}`}
            className="hover:text-foreground transition-colors"
          >
            {task.title}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Workflow</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Extension Active
          </Badge>
        </div>
      </div>

      {/* Executor fills remaining space */}
      <div className="flex-1 overflow-hidden">
        {template && instance && (
          <WorkflowExecutor
            template={template}
            instance={instance}
            onUpdateInstance={(updated) => setInstance(updated)}
          />
        )}
      </div>
    </div>
  )
}
