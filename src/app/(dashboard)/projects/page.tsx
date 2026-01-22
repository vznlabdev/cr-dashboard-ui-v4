"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  UserPlus,
  Check,
  Building2,
  Send,
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

      {/* Search & Filters - Prominent placement above stats */}
      <div className="flex flex-col gap-3 pb-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-11">
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
              className="h-11"
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
                  <TableHead>Brand</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Target Date</TableHead>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-2 hover:bg-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {mockCompanies.find(c => c.id === project.companyId)?.name || 'Select brand'}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="bottom" sideOffset={5} avoidCollisions={false} className="w-56">
                            {mockCompanies.map((company) => (
                              <DropdownMenuItem
                                key={company.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProject(project.id, { ...project, companyId: company.id });
                                }}
                                className="gap-2"
                              >
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="flex-1">{company.name}</span>
                                {project.companyId === company.id && <Check className="h-4 w-4" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const projectTasks = getTasksByProject(project.id);
                          const totalTasks = projectTasks.length;
                          const completedTasks = projectTasks.filter(t => t.status === 'delivered').length;
                          const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                          
                          // Risk badge styling
                          const getRiskColor = (risk: string) => {
                            switch (risk) {
                              case 'Low': return 'text-green-400';
                              case 'Medium': return 'text-yellow-400';
                              case 'High': return 'text-red-400';
                              default: return 'text-gray-400';
                            }
                          };
                          
                          // Progress bar color based on completion
                          const getProgressColor = (percent: number) => {
                            if (percent >= 75) return 'bg-green-500';
                            if (percent >= 50) return 'bg-yellow-500';
                            if (percent >= 25) return 'bg-orange-500';
                            return 'bg-red-500';
                          };
                          
                          return (
                            <div className="flex flex-col gap-1.5">
                              {/* Risk Level */}
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-medium ${getRiskColor(project.risk)}`}>
                                  {project.risk} Risk
                                </span>
                              </div>
                              {/* Task Completion */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {totalTasks} task{totalTasks !== 1 ? 's' : ''} • {completionPercent}%
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-2 hover:bg-accent"
                              onClick={(e) => e.stopPropagation()}
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
                          <DropdownMenuContent align="start" side="bottom" sideOffset={5} avoidCollisions={false} className="w-48">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-2 hover:bg-accent w-full justify-start"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {project.owner ? (
                                <>
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ 
                                      backgroundColor: TEAM_MEMBERS.find(m => m.fullName === project.owner)?.avatarColor || '#3b82f6' 
                                    }}
                                  >
                                    {project.owner.charAt(0)}
                                  </div>
                                  <span className="text-sm">{project.owner.split(' ')[0].toLowerCase()}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                                    <Minus className="h-3 w-3 text-gray-400" />
                                  </div>
                                  <span className="text-sm text-muted-foreground">No lead</span>
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="start" 
                            side="bottom" 
                            sideOffset={5}
                            avoidCollisions={false}
                            className="w-56"
                          >
                            {/* No Lead Option */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProject(project.id, { ...project, owner: '' });
                              }}
                              className="gap-2"
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                                <Minus className="h-3 w-3 text-gray-400" />
                              </div>
                              <span className="flex-1">No lead</span>
                              <span className="text-xs text-muted-foreground">0</span>
                            </DropdownMenuItem>
                            
                            {/* Current Selection (if exists) */}
                            {project.owner && (
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="gap-2 bg-accent"
                              >
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                  style={{ 
                                    backgroundColor: TEAM_MEMBERS.find(m => m.fullName === project.owner)?.avatarColor || '#3b82f6' 
                                  }}
                                >
                                  {project.owner.charAt(0)}
                                </div>
                                <span className="flex-1">{project.owner.split(' ')[0].toLowerCase()}</span>
                                <Check className="h-4 w-4" />
                              </DropdownMenuItem>
                            )}

                            {/* Section Header */}
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              Users from the project team
                            </div>

                            {/* Team Members */}
                            {TEAM_MEMBERS.filter(member => 
                              member.name !== project.owner?.split(' ')[0].toLowerCase()
                            ).map((member) => (
                              <DropdownMenuItem
                                key={member.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateProject(project.id, { ...project, owner: member.fullName });
                                }}
                                className="gap-2"
                              >
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                  style={{ backgroundColor: member.avatarColor }}
                                >
                                  {member.fullName.charAt(0)}
                                </div>
                                <span className="flex-1">{member.name}</span>
                              </DropdownMenuItem>
                            ))}

                            {/* Section Header */}
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-1">
                              New user
                            </div>

                            {/* Invite Option */}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Open invite modal
                                console.log('Invite new user');
                              }}
                              className="gap-2"
                            >
                              <UserPlus className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1">Invite and add...</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 hover:bg-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center -space-x-2">
                                {/* Show up to 3 member avatars */}
                                {(project.members || []).slice(0, 3).map((memberName, i) => {
                                  const member = TEAM_MEMBERS.find(m => m.fullName === memberName);
                                  return (
                                    <div
                                      key={i}
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-background"
                                      style={{ backgroundColor: member?.avatarColor || '#64748b' }}
                                    >
                                      {memberName.charAt(0)}
                                    </div>
                                  );
                                })}
                                {(project.members || []).length > 3 && (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-700 text-white text-xs font-semibold border-2 border-background">
                                    +{(project.members || []).length - 3}
                                  </div>
                                )}
                                {(!project.members || project.members.length === 0) && (
                                  <span className="text-sm text-muted-foreground px-2">No members</span>
                                )}
                              </div>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="start" 
                            side="bottom" 
                            sideOffset={5} 
                            className="w-80 p-0"
                            avoidCollisions={false}
                          >
                            {/* Search Input */}
                            <div className="p-3 border-b border-border">
                              <Input
                                placeholder="Change members..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                className="h-9 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            <div className="max-h-[400px] overflow-y-auto p-2">
                              {/* Current Members */}
                              {(project.members || []).map((memberName) => {
                                const member = TEAM_MEMBERS.find(m => m.fullName === memberName);
                                if (!member) return null;
                                
                                const isProjectLead = project.owner === memberName;
                                const matchesSearch = memberSearchQuery === '' || 
                                  member.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                  member.name.toLowerCase().includes(memberSearchQuery.toLowerCase());
                                
                                if (!matchesSearch) return null;

                                return (
                                  <div
                                    key={member.id}
                                    className="flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newMembers = (project.members || []).filter(m => m !== memberName);
                                      updateProject(project.id, { ...project, members: newMembers });
                                    }}
                                  >
                                    <Checkbox checked={true} className="pointer-events-none" />
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                      style={{ backgroundColor: member.avatarColor }}
                                    >
                                      {member.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm">{member.name}</div>
                                      {isProjectLead && (
                                        <div className="text-xs text-muted-foreground">Project lead</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Section Header */}
                              <div className="px-2 py-2 text-xs font-semibold text-muted-foreground mt-2">
                                Users from the project team
                              </div>

                              {/* Available Team Members (not already added) */}
                              {TEAM_MEMBERS.filter(member => 
                                !(project.members || []).includes(member.fullName) &&
                                (memberSearchQuery === '' || 
                                  member.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                  member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                              ).map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newMembers = [...(project.members || []), member.fullName];
                                    updateProject(project.id, { ...project, members: newMembers });
                                  }}
                                >
                                  <Checkbox checked={false} className="pointer-events-none" />
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ backgroundColor: member.avatarColor }}
                                  >
                                    {member.fullName.charAt(0)}
                                  </div>
                                  <span className="text-sm">{member.name}</span>
                                </div>
                              ))}

                              {/* New User Section */}
                              <div className="px-2 py-2 text-xs font-semibold text-muted-foreground mt-2">
                                New user
                              </div>
                              <div
                                className="flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md cursor-pointer text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement invite user functionality
                                  console.log('Invite user clicked');
                                }}
                              >
                                <Send className="h-4 w-4" />
                                <span className="text-sm">Invite and add...</span>
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {/* Mock target dates based on project id */}
                          {['Mar 15, 2024', 'Apr 30, 2024', 'May 20, 2024', 'Jun 10, 2024', 'Jul 5, 2024'][parseInt(project.id) % 5]}
                        </span>
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
                          <DropdownMenuContent align="end" side="bottom" sideOffset={5} avoidCollisions={false}>
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
