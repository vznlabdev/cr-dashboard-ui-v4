"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
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
  User,
  BarChart3,
  BarChart2,
  BarChart,
  Minus,
  UserPlus,
  Check,
  Building2,
  Send,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns"
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
import { mockCompanies, getTasksByProject } from "@/lib/mock-data/projects-tasks"
import {
  calculateTIV,
  formatLargeCurrency,
  calculatePortfolioTIV,
} from "@/lib/insurance-utils"
import type { DistributionLevel } from "@/types"

// Team members for project lead assignment
const TEAM_MEMBERS = [
  { id: 'jgordon', name: 'jgordon', fullName: 'Jeff Gordon', avatarColor: '#ef4444' },
  { id: 'abdul.qadeer', name: 'abdul.qadeer', fullName: 'Abdul Qadeer', avatarColor: '#a855f7' },
  { id: 'asad', name: 'asad', fullName: 'Asad', avatarColor: '#06b6d4' },
  { id: 'dev.vznlab', name: 'dev.vznlab', fullName: 'Dev Vznlab', avatarColor: '#8b5cf6' },
  { id: 'husnain.raza', name: 'husnain.raza', fullName: 'Husnain Raza', avatarColor: '#ec4899' },
  { id: 'jg', name: 'jg', fullName: 'JG', avatarColor: '#78350f' },
  { id: 'ryan', name: 'ryan', fullName: 'Ryan', avatarColor: '#b45309' },
  { id: 'zlane', name: 'zlane', fullName: 'Zlane', avatarColor: '#10b981' },
]

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, updateProject, deleteProject } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProjectState, setDeleteProjectState] = useState<Project | null>(null)
  const [calendarState, setCalendarState] = useState<{ [key: string]: { open: boolean; currentMonth: Date } }>({});

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
      {/* Page Header - Linear Style */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Button 
          size="sm"
          onClick={() => setNewProjectDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search & Filters - Linear Style */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9">
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
              size="sm"
              className="h-9"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Inline Stats - Linear Style */}
        <div className="text-sm text-muted-foreground">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          {statusFilter === "all" && (
            <>
              {' • '}
              {activeProjects} active
              {' • '}
              {pendingProjects} in review
              {completedProjects > 0 && (
                <>
                  {' • '}
                  {completedProjects} completed
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Projects Table - Linear Style */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 w-[35%] text-xs font-medium">Project</TableHead>
                  <TableHead className="h-11 w-[15%] text-xs font-medium">Brand</TableHead>
                  <TableHead className="h-11 w-[12%] text-xs font-medium">Status</TableHead>
                  <TableHead className="h-11 w-[15%] text-xs font-medium">Tasks</TableHead>
                  <TableHead className="h-11 w-[13%] text-xs font-medium">Updated</TableHead>
                  <TableHead className="h-11 w-[10%] text-xs font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
                      className="h-12 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      {/* Project Name with Lead Avatar */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          {/* Lead Avatar */}
                          {project.owner ? (
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                              style={{ 
                                backgroundColor: TEAM_MEMBERS.find(m => m.fullName === project.owner)?.avatarColor || '#3b82f6' 
                              }}
                            >
                              {project.owner.charAt(0)}
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <User className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-sm font-medium truncate">{project.name}</span>
                        </div>
                      </TableCell>

                      {/* Brand - Simple Display */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ 
                              backgroundColor: project.companyId === '1' ? '#3b82f6' : 
                                             project.companyId === '2' ? '#8b5cf6' : '#10b981' 
                            }}
                          />
                          <span className="text-xs truncate">
                            {mockCompanies.find(c => c.id === project.companyId)?.name || 'No brand'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5",
                            project.status === "Active" && "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                            project.status === "Review" && "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                            project.status === "Draft" && "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                            project.status === "Approved" && "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                          )}
                        >
                          {project.status}
                        </Badge>
                      </TableCell>

                      {/* Tasks - Simple Display */}
                      <TableCell className="py-2">
                        {(() => {
                          const projectTasks = getTasksByProject(project.id);
                          const totalTasks = projectTasks.length;
                          const completedTasks = projectTasks.filter(t => t.status === 'delivered').length;
                          
                          return (
                            <span className="text-xs text-muted-foreground">
                              {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} • {completedTasks} done
                            </span>
                          );
                        })()}
                      </TableCell>
                      {/* Updated */}
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {project.updated}
                      </TableCell>
                      <TableCell className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="bottom" sideOffset={5} avoidCollisions={false}>
                            <DropdownMenuItem asChild>
                              <Link href={`/projects/${project.id}/tasks`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Tasks
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
