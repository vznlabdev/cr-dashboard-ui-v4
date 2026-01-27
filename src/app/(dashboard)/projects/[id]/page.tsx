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
import { ArrowLeft, CheckCircle } from "lucide-react"
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


      {/* Tasks Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Tasks</CardTitle>
            </div>
            <Badge variant="secondary" className="text-base font-semibold">
              {projectTasks.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              View and manage all tasks for this project on the dedicated tasks page
            </p>
            <Button onClick={() => router.push(`/projects/${projectId}/tasks`)}>
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
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
