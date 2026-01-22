"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { notFound, useParams, useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/PageContainer"
import { useData } from "@/contexts/data-context"
import { getTasksByProject } from "@/lib/mock-data/projects-tasks"
import type { Task } from "@/types"
import { ArrowLeft, Briefcase, Scale, Shield, Folder } from "lucide-react"
import { Suspense } from "react"

function ProjectDetailContent() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { getProjectById } = useData()

  // Fetch project from data context (consistent with projects list)
  const project = getProjectById(projectId)

  if (!project) {
    notFound()
  }

  // Fetch all tasks for this project
  const projectTasks = getTasksByProject(projectId)

  // Group tasks by workstream - include all 4 workstream types
  const creatorTasks = projectTasks.filter((t) => t.workstream === "creator")
  const legalTasks = projectTasks.filter((t) => t.workstream === "legal")
  const insuranceTasks = projectTasks.filter((t) => t.workstream === "insurance")
  const generalTasks = projectTasks.filter((t) => t.workstream === "general")

  // Helper function to get task status badge variant
  const getTaskStatusVariant = (status: Task["status"]) => {
    switch (status) {
      case "delivered":
        return "default"
      case "qa_review":
        return "secondary"
      case "production":
        return "secondary"
      case "assigned":
        return "outline"
      case "assessment":
        return "outline"
      case "submitted":
        return "outline"
      default:
        return "outline"
    }
  }

  // Helper function to get project status badge variant
  const getProjectStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Review":
        return "secondary"
      case "Draft":
        return "outline"
      case "Approved":
        return "default"
      default:
        return "outline"
    }
  }

  // Helper function to get risk badge variant
  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case "Low":
        return "default"
      case "Medium":
        return "secondary"
      case "High":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/projects")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Button>

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
            <Badge variant={getProjectStatusVariant(project.status)}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Creator Tasks Column */}
        <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Creator Tasks</CardTitle>
              </div>
              <Badge variant="secondary" className="text-base font-semibold">
                {creatorTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[200px]">
            {creatorTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  No creator tasks yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks will appear here when assigned
                </p>
              </div>
            ) : (
              creatorTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                      <Badge variant={getTaskStatusVariant(task.status)} className="text-xs shrink-0">
                        {task.status}
                      </Badge>
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground">
                        👤 {task.assignee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        📅 Due: {task.dueDate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Legal Tasks Column */}
        <Card className="border-t-4 border-t-amber-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Legal Tasks</CardTitle>
              </div>
              <Badge variant="secondary" className="text-base font-semibold">
                {legalTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[200px]">
            {legalTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Scale className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  No legal tasks yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Legal review tasks will appear here
                </p>
              </div>
            ) : (
              legalTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                      <Badge variant={getTaskStatusVariant(task.status)} className="text-xs shrink-0">
                        {task.status}
                      </Badge>
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground">
                        👤 {task.assignee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        📅 Due: {task.dueDate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Insurance Tasks Column */}
        <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Insurance Tasks</CardTitle>
              </div>
              <Badge variant="secondary" className="text-base font-semibold">
                {insuranceTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[200px]">
            {insuranceTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  No insurance tasks yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Insurance verification tasks will appear here
                </p>
              </div>
            ) : (
              insuranceTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                      <Badge variant={getTaskStatusVariant(task.status)} className="text-xs shrink-0">
                        {task.status}
                      </Badge>
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground">
                        👤 {task.assignee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        📅 Due: {task.dueDate}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* General Tasks Column */}
        <Card className="border-t-4 border-t-gray-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-lg">General Tasks</CardTitle>
              </div>
              <Badge variant="secondary" className="text-base font-semibold">
                {generalTasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[200px]">
            {generalTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Folder className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  No general tasks yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Miscellaneous tasks will appear here
                </p>
              </div>
            ) : (
              generalTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="border-l-4 border-l-gray-500 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                      <Badge variant={getTaskStatusVariant(task.status)} className="text-xs shrink-0">
                        {task.status}
                      </Badge>
                    </div>
                    {task.assignee && (
                      <p className="text-xs text-muted-foreground">
                        👤 {task.assignee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        📅 Due: {task.dueDate}
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

// Loading skeleton component
function ProjectDetailSkeleton() {
  return (
    <PageContainer className="space-y-6 animate-fade-in">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-6 w-96" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full max-w-2xl" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </PageContainer>
  )
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetailContent />
    </Suspense>
  )
}
