"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  BarChart2,
  BarChart,
  Minus,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useMemo } from "react"
import { NewProjectDialog, EditProjectDialog, DeleteProjectDialog } from "@/components/cr"
import { useData, type Project } from "@/contexts/data-context"
import { PageContainer } from "@/components/layout/PageContainer"
import {
  calculateTIV,
  formatLargeCurrency,
  calculatePortfolioTIV,
} from "@/lib/insurance-utils"
import type { DistributionLevel } from "@/types"

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, updateProject, deleteProject } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProjectState, setDeleteProjectState] = useState<Project | null>(null)

  // Calculate TIV for each project
  const projectsWithTIV = useMemo(() => {
    const distributionLevel: DistributionLevel = "National" as DistributionLevel
    const baseValuePerAsset = 2000
    
    return projects.map(project => {
      const riskMultiplier = project.risk === "Low" ? 1.0 : project.risk === "Medium" ? 1.5 : 2.0
      const distributionMultiplier: number = distributionLevel === "Internal" ? 1.0 :
                                      distributionLevel === "Regional" ? 1.5 :
                                      distributionLevel === "National" ? 2.5 : 4.0
      
      const totalAssetValue = project.assets * baseValuePerAsset
      const tiv = calculateTIV(totalAssetValue, riskMultiplier, distributionMultiplier)
      
      return { ...project, tiv }
    })
  }, [projects])

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projectsWithTIV.filter((project) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      return matchesSearch && matchesStatus
    })

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name))

    return filtered
  }, [projectsWithTIV, searchQuery, statusFilter])

  // Stats calculations
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === "Active").length
  const completedProjects = projects.filter(p => p.status === "Approved").length
  const pendingProjects = projects.filter(p => p.status === "Review").length

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Organize creative projects and workflows
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => setNewProjectDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              All projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Approved projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProjects}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            View and manage your content creation projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FolderKanban className="h-8 w-8 opacity-50" />
                        <p>No projects found</p>
                        {(searchQuery || statusFilter !== "all") && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("")
                              setStatusFilter("all")
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id}
                      onClick={() => router.push(`/projects/${project.id}/tasks`)}
                      className="cursor-pointer hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📈</span>
                          <span className="text-sm text-muted-foreground">
                            On track • {(parseInt(project.id) % 12) + 1}mo
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-2 hover:bg-accent"
                            >
                              {project.priority === 'urgent' && (
                                <>
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-sm">Urgent</span>
                                </>
                              )}
                              {project.priority === 'high' && (
                                <>
                                  <BarChart3 className="h-4 w-4 text-orange-500" />
                                  <span className="text-sm">High</span>
                                </>
                              )}
                              {project.priority === 'medium' && (
                                <>
                                  <BarChart2 className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">Medium</span>
                                </>
                              )}
                              {project.priority === 'low' && (
                                <>
                                  <BarChart className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">Low</span>
                                </>
                              )}
                              {(!project.priority || project.priority === null) && (
                                <>
                                  <Minus className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-muted-foreground">No priority</span>
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject(project.id, { ...project, priority: null });
                              }}
                              className="gap-2"
                            >
                              <Minus className="h-4 w-4 text-gray-500" />
                              <span className="flex-1">No priority</span>
                              <span className="text-xs text-muted-foreground">0</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject(project.id, { ...project, priority: 'urgent' });
                              }}
                              className="gap-2"
                            >
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="flex-1">Urgent</span>
                              <span className="text-xs text-muted-foreground">1</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject(project.id, { ...project, priority: 'high' });
                              }}
                              className="gap-2"
                            >
                              <BarChart3 className="h-4 w-4 text-orange-500" />
                              <span className="flex-1">High</span>
                              <span className="text-xs text-muted-foreground">2</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject(project.id, { ...project, priority: 'medium' });
                              }}
                              className="gap-2"
                            >
                              <BarChart2 className="h-4 w-4 text-blue-500" />
                              <span className="flex-1">Medium</span>
                              <span className="text-xs text-muted-foreground">3</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject(project.id, { ...project, priority: 'low' });
                              }}
                              className="gap-2"
                            >
                              <BarChart className="h-4 w-4 text-gray-500" />
                              <span className="flex-1">Low</span>
                              <span className="text-xs text-muted-foreground">4</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {project.owner.charAt(0)}
                          </div>
                          <span className="text-sm">{project.owner.split(' ')[0].toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{project.assets} assets</TableCell>
                      <TableCell>
                        <span className={getComplianceColor(project.compliance)}>
                          {project.compliance}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskVariant(project.risk)}>
                          {project.risk}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {project.updated}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/projects/${project.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditProject(project)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteProjectState(project)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
      />
      <EditProjectDialog
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject}
      />
      <DeleteProjectDialog
        open={!!deleteProjectState}
        onOpenChange={(open) => !open && setDeleteProjectState(null)}
        project={deleteProjectState}
      />
    </PageContainer>
  )
}

// Helper functions
function getStatusVariant(status: string) {
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
      return "secondary"
  }
}

function getComplianceColor(score: number) {
  if (score >= 90) return "text-green-500 font-medium"
  if (score >= 70) return "text-amber-500 font-medium"
  return "text-destructive font-medium"
}

function getRiskVariant(risk: string) {
  switch (risk) {
    case "Low":
      return "default"
    case "Medium":
      return "secondary"
    case "High":
      return "destructive"
    default:
      return "secondary"
  }
}
