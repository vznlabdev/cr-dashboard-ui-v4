"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Plus,
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
  Archive,
  Copy,
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

// Legal team: assigned attorneys and mock legal fields per project
const ASSIGNED_ATTORNEYS = ["Sarah Chen", "Michael Torres", "Jennifer Walsh", "David Kim", "Emily Ross"]
type ComplianceStatus = "Pending Review" | "Approved" | "Flagged" | "Rejected"
type NILPStatus = "Cleared" | "Pending" | "Not Required" | "Under Review"

function getLegalFields(project: Project & { tiv?: number }) {
  const statusMap: Record<string, ComplianceStatus> = {
    "1": "Flagged",
    "2": "Pending Review",
    "3": "Pending Review",
    "4": "Rejected",
    "5": "Approved",
  }
  const nilpMap: Record<string, NILPStatus> = {
    "1": "Under Review",
    "2": "Pending",
    "3": "Cleared",
    "4": "Not Required",
    "5": "Cleared",
  }
  const lastReviewMap: Record<string, string> = {
    "1": "Feb 1, 2025",
    "2": "Jan 28, 2025",
    "3": "Jan 15, 2025",
    "4": "Jan 10, 2025",
    "5": "Feb 5, 2025",
  }
  const attorneyIndex = parseInt(project.id, 10) % ASSIGNED_ATTORNEYS.length
  return {
    complianceStatus: statusMap[project.id] ?? (project.status === "Approved" ? "Approved" : "Pending Review"),
    nilpRightsStatus: nilpMap[project.id] ?? "Pending",
    lastReviewDate: lastReviewMap[project.id] ?? "—",
    assignedAttorney: ASSIGNED_ATTORNEYS[attorneyIndex] ?? ASSIGNED_ATTORNEYS[0],
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, updateProject, deleteProject } = useData()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [leadFilter, setLeadFilter] = useState<string>("all")
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
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
      const legal = getLegalFields({ ...project, tiv })
      return { ...project, tiv, ...legal }
    })
  }, [projects])

  // Filter projects (by compliance status, brand, lead)
  const [complianceFilter, setComplianceFilter] = useState<string>("all")
  const filteredProjects = useMemo(() => {
    let filtered = projectsWithTIV.filter((project) => {
      const legal = getLegalFields(project)
      const matchesCompliance = complianceFilter === "all" || legal.complianceStatus === complianceFilter
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesBrand = brandFilter === "all" || project.companyId === brandFilter
      const matchesLead = leadFilter === "all" || project.owner === leadFilter
      return matchesCompliance && matchesStatus && matchesBrand && matchesLead
    })

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name))

    return filtered
  }, [projectsWithTIV, complianceFilter, statusFilter, brandFilter, leadFilter])

  // Legal stats - based on filtered results
  const hasActiveFilters = complianceFilter !== "all" || statusFilter !== "all" || brandFilter !== "all" || leadFilter !== "all"
  const displayProjects = filteredProjects
  const totalUnderReview = displayProjects.filter(p => getLegalFields(p).complianceStatus === "Pending Review").length
  const totalFlagged = displayProjects.filter(p => getLegalFields(p).complianceStatus === "Flagged").length
  const totalApproved = displayProjects.filter(p => getLegalFields(p).complianceStatus === "Approved").length
  const totalRejectedBlocked = displayProjects.filter(p => getLegalFields(p).complianceStatus === "Rejected").length

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header - Linear Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {displayProjects.length} {displayProjects.length === 1 ? "case" : "cases"}
            {!hasActiveFilters && (
              <>
                {" • "}
                {totalUnderReview} under review
                {" • "}
                {totalFlagged} flagged
                {" • "}
                {totalApproved} approved
                {totalRejectedBlocked > 0 && (
                  <>
                    {" • "}
                    {totalRejectedBlocked} rejected/blocked
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <Button 
          size="sm"
          onClick={() => setNewProjectDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Legal Review
        </Button>
      </div>

      {/* Legal Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total cases under review</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{projectsWithTIV.filter(p => getLegalFields(p).complianceStatus === "Pending Review").length}</span>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged for legal issues</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{projectsWithTIV.filter(p => getLegalFields(p).complianceStatus === "Flagged").length}</span>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved cases</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{projectsWithTIV.filter(p => getLegalFields(p).complianceStatus === "Approved").length}</span>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected / Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold text-destructive">{projectsWithTIV.filter(p => getLegalFields(p).complianceStatus === "Rejected").length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Linear Style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Select value={complianceFilter} onValueChange={setComplianceFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="Compliance Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Compliance</SelectItem>
            <SelectItem value="Pending Review">Pending Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Flagged">Flagged</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
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

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {mockCompanies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={leadFilter} onValueChange={setLeadFilter}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="Lead" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" sideOffset={4} avoidCollisions={false}>
            <SelectItem value="all">All Leads</SelectItem>
            {TEAM_MEMBERS.map((member) => (
              <SelectItem key={member.id} value={member.fullName}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(complianceFilter !== "all" || statusFilter !== "all" || brandFilter !== "all" || leadFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => {
              setComplianceFilter("all")
              setStatusFilter("all")
              setBrandFilter("all")
              setLeadFilter("all")
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedProjects.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={selectedProjects.size === filteredProjects.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedProjects(new Set(filteredProjects.map(p => p.id)))
                } else {
                  setSelectedProjects(new Set())
                }
              }}
            />
            <span className="text-sm font-medium">
              {selectedProjects.size} {selectedProjects.size === 1 ? 'project' : 'projects'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Archive functionality
                console.log('Archive projects:', Array.from(selectedProjects))
                setSelectedProjects(new Set())
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Duplicate functionality
                console.log('Duplicate projects:', Array.from(selectedProjects))
                setSelectedProjects(new Set())
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProjects(new Set())}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Projects Table - Linear Style */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 w-[40px]">
                    <Checkbox 
                      checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProjects(new Set(filteredProjects.map(p => p.id)))
                        } else {
                          setSelectedProjects(new Set())
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="h-11 text-xs font-medium">Project name</TableHead>
                  <TableHead className="h-11 text-xs font-medium">Client / Brand</TableHead>
                  <TableHead className="h-11 text-xs font-medium">Compliance Status</TableHead>
                  <TableHead className="h-11 text-xs font-medium">Risk Level</TableHead>
                  <TableHead className="h-11 text-xs font-medium">NILP Rights Status</TableHead>
                  <TableHead className="h-11 text-xs font-medium">Last Review Date</TableHead>
                  <TableHead className="h-11 text-xs font-medium">Assigned Attorney</TableHead>
                  <TableHead className="h-11 w-[80px] text-xs font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FolderKanban className="h-8 w-8 opacity-50" />
                        <p>No projects found</p>
                        {(statusFilter !== "all" || brandFilter !== "all" || leadFilter !== "all") && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              setStatusFilter("all")
                              setBrandFilter("all")
                              setLeadFilter("all")
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => {
                    const legal = getLegalFields(project)
                    return (
                    <TableRow 
                      key={project.id}
                      className="h-12 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      {/* Checkbox */}
                      <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedProjects.has(project.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedProjects)
                            if (checked) {
                              newSelected.add(project.id)
                            } else {
                              newSelected.delete(project.id)
                            }
                            setSelectedProjects(newSelected)
                          }}
                        />
                      </TableCell>

                      {/* Project name */}
                      <TableCell 
                        className="py-2 cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <span className="text-sm font-medium truncate">{project.name}</span>
                      </TableCell>

                      {/* Client / Brand */}
                      <TableCell 
                        className="py-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (project.companyId) {
                            router.push(`/creative/brands/${project.companyId}`)
                          }
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ 
                              backgroundColor: project.companyId === "company-1" ? "#3b82f6" : 
                                             project.companyId === "company-2" ? "#8b5cf6" : "#10b981" 
                            }}
                          />
                          <span className="text-xs truncate">
                            {mockCompanies.find(c => c.id === project.companyId)?.name ?? "No brand"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Compliance Status */}
                      <TableCell 
                        className="py-2 cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5",
                            legal.complianceStatus === "Pending Review" && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                            legal.complianceStatus === "Approved" && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                            legal.complianceStatus === "Flagged" && "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
                            legal.complianceStatus === "Rejected" && "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {legal.complianceStatus}
                        </Badge>
                      </TableCell>

                      {/* Risk Level */}
                      <TableCell 
                        className="py-2 cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5",
                            project.risk === "Low" && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                            project.risk === "Medium" && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                            (project.risk === "High" || project.risk === "urgent") && "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {project.risk === "urgent" ? "Critical" : project.risk ?? "Low"}
                        </Badge>
                      </TableCell>

                      {/* NILP Rights Status */}
                      <TableCell 
                        className="py-2 text-xs cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        {legal.nilpRightsStatus}
                      </TableCell>

                      {/* Last Review Date */}
                      <TableCell 
                        className="py-2 text-xs text-muted-foreground cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        {legal.lastReviewDate}
                      </TableCell>

                      {/* Assigned Attorney */}
                      <TableCell 
                        className="py-2 text-xs cursor-pointer"
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        {legal.assignedAttorney}
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
                            <DropdownMenuItem onClick={() => {
                              // Duplicate project logic
                              console.log('Duplicate project:', project.id)
                              // TODO: Implement duplicate functionality
                            }}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate Project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              // Archive project logic
                              console.log('Archive project:', project.id)
                              // TODO: Implement archive functionality
                            }}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive Project
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
                    )
                  })
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
