"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { notFound, useParams } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { mockProjects, mockTasks, getTasksByProject } from "@/lib/mock-data/projects-tasks"
import type { Task } from "@/types"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  // Fetch project by id
  const project = mockProjects.find((p) => p.id === projectId)

  if (!project) {
    notFound()
  }

  // Fetch all tasks for this project
  const projectTasks = getTasksByProject(projectId)

  // Group tasks by workstream
  const creatorTasks = projectTasks.filter((t) => t.workstream === "creator")
  const legalTasks = projectTasks.filter((t) => t.workstream === "legal")
  const insuranceTasks = projectTasks.filter((t) => t.workstream === "insurance")

  // Helper function to get status badge variant
  const getStatusVariant = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "production":
        return "secondary"
      case "review":
        return "outline"
      case "assessment":
        return "outline"
      case "submitted":
        return "outline"
      default:
        return "outline"
    }
  }

  // Helper function to get risk badge variant
  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case "low":
        return "default"
      case "medium":
        return "secondary"
      case "high":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Project Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {project.description}
            </p>
          )}
        </div>

        {/* Project Stats */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={project.status === "active" ? "default" : "outline"}>
              {project.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Compliance:</span>
            <span className="text-sm font-medium">{project.compliance}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Risk:</span>
            <Badge variant={getRiskVariant(project.risk)}>
              {project.risk}
            </Badge>
          </div>
        </div>
      </div>

      {/* Workstream Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Creator Tasks Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Creator Tasks ({creatorTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {creatorTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No creator tasks
              </p>
            ) : (
              creatorTasks.map((task) => (
                <Card key={task.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <Badge variant={getStatusVariant(task.status)} className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground">
                        Assignee: {task.assignee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {task.dueDate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Legal Tasks Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Legal Tasks ({legalTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {legalTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No legal tasks
              </p>
            ) : (
              legalTasks.map((task) => (
                <Card key={task.id} className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <Badge variant={getStatusVariant(task.status)} className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground">
                        Assignee: {task.assignee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {task.dueDate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Insurance Tasks Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Insurance Tasks ({insuranceTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insuranceTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No insurance tasks
              </p>
            ) : (
              insuranceTasks.map((task) => (
                <Card key={task.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <Badge variant={getStatusVariant(task.status)} className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground">
                        Assignee: {task.assignee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {task.dueDate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
