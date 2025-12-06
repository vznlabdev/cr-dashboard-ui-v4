"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
} from "lucide-react"
import { mockTeamMembers, mockTickets } from "@/lib/mock-data/creative"
import { TeamMemberCard, WorkloadBar } from "@/components/creative"
import { WorkflowRole, WORKFLOW_ROLE_CONFIG } from "@/types/creative"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/layout/PageContainer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type ViewType = "grid" | "list"
type RoleFilter = WorkflowRole | "all"

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<ViewType>("grid")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // Filter members
  const filteredMembers = mockTeamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Calculate stats
  const totalMembers = mockTeamMembers.length
  const availableMembers = mockTeamMembers.filter((m) => m.isAvailable).length
  const activeTickets = mockTickets.filter((t) => t.status !== "delivered").length
  const avgWorkload = Math.round(
    mockTeamMembers.reduce((acc, m) => acc + m.currentLoad, 0) / totalMembers
  )

  // Get role counts
  const getRoleCount = (role: RoleFilter) => {
    if (role === "all") return mockTeamMembers.length
    return mockTeamMembers.filter((m) => m.role === role).length
  }

  // Internal roles to show in filter
  const internalRoles: WorkflowRole[] = ["team_leader", "creative", "qa", "assessment"]

  const handleInvite = () => {
    toast.success("Invitation sent!")
    setInviteDialogOpen(false)
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage team members and workload distribution
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Invite a new team member to the creative workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {internalRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {WORKFLOW_ROLE_CONFIG[role].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>Send Invite</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-0">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">team members</p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold">{availableMembers}</div>
            <p className="text-xs text-muted-foreground">ready to work</p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold">{activeTickets}</div>
            <p className="text-xs text-muted-foreground">in progress</p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
            <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold">{avgWorkload}%</div>
            <WorkloadBar current={avgWorkload} max={100} showLabel={false} size="sm" />
          </CardContent>
        </Card>
      </div>

      {/* Search, Filters, and View Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or skill..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Role Filter Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={roleFilter === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setRoleFilter("all")}
        >
          All ({getRoleCount("all")})
        </Badge>
        {internalRoles.map((role) => (
          <Badge
            key={role}
            variant={roleFilter === role ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              roleFilter === role && "bg-primary text-primary-foreground"
            )}
            onClick={() => setRoleFilter(role)}
          >
            {WORKFLOW_ROLE_CONFIG[role].label} ({getRoleCount(role)})
          </Badge>
        ))}
      </div>

      {/* Team Grid/List */}
      {view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} variant="list" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">
            {searchQuery || roleFilter !== "all"
              ? "No team members found matching your criteria."
              : "No team members yet."}
          </p>
          {!searchQuery && roleFilter === "all" && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Member
            </Button>
          )}
        </div>
      )}
    </PageContainer>
  )
}
