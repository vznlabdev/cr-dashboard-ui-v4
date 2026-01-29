"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Eye,
  Mail,
  UserX,
} from "lucide-react"
import { mockTeamMembers, mockTickets } from "@/lib/mock-data/creative"
import { WorkloadBar } from "@/components/creative"
import { WorkflowRole, WORKFLOW_ROLE_CONFIG } from "@/types/creative"
import { PageContainer } from "@/components/layout/PageContainer"
import { toast } from "sonner"

type RoleFilter = WorkflowRole | "all"
type AvailabilityFilter = "all" | "available" | "unavailable"

export default function TeamPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all")
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // Internal roles to show in filter
  const internalRoles: WorkflowRole[] = ["team_leader", "creative", "qa", "assessment"]

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setRoleFilter("all")
    setAvailabilityFilter("all")
  }

  // Filter members
  const filteredMembers = mockTeamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && member.isAvailable) ||
      (availabilityFilter === "unavailable" && !member.isAvailable)
    return matchesSearch && matchesRole && matchesAvailability
  })

  // Calculate stats
  const availableCount = filteredMembers.filter((m) => m.isAvailable).length
  const activeTickets = mockTickets.filter((t) => t.status !== "delivered").length

  const handleInvite = () => {
    toast.success("Invitation sent!")
    setInviteDialogOpen(false)
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header - Linear Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Team</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            {' • '}
            {availableCount} available
            {' • '}
            {activeTickets} active tickets
          </div>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
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

      {/* Filters - Linear Style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Filter Dropdown */}
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {internalRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {WORKFLOW_ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Availability Filter */}
        <Select value={availabilityFilter} onValueChange={(value) => setAvailabilityFilter(value as AvailabilityFilter)}>
          <SelectTrigger className="w-full sm:w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {(roleFilter !== "all" || searchQuery || availabilityFilter !== "all") && (
          <Button variant="ghost" size="sm" className="h-9" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedMembers.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedMembers.size === filteredMembers.length}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedMembers(new Set(filteredMembers.map(m => m.id)))
                } else {
                  setSelectedMembers(new Set())
                }
              }}
            />
            <span className="text-sm font-medium">
              {selectedMembers.size} {selectedMembers.size === 1 ? 'member' : 'members'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success("Message feature coming soon!")
                setSelectedMembers(new Set())
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success("Remove feature coming soon!")
                setSelectedMembers(new Set())
              }}
            >
              <UserX className="mr-2 h-4 w-4" />
              Remove
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMembers(new Set())}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Team Table - Linear Style */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 w-[40px]">
                <Checkbox
                  checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMembers(new Set(filteredMembers.map(m => m.id)))
                    } else {
                      setSelectedMembers(new Set())
                    }
                  }}
                />
              </TableHead>
              <TableHead className="h-11 w-[30%] text-xs font-medium">Member</TableHead>
              <TableHead className="h-11 w-[15%] text-xs font-medium">Role</TableHead>
              <TableHead className="h-11 w-[12%] text-xs font-medium">Status</TableHead>
              <TableHead className="h-11 w-[18%] text-xs font-medium">Workload</TableHead>
              <TableHead className="h-11 w-[12%] text-xs font-medium">Tickets</TableHead>
              <TableHead className="h-11 w-[10%] text-xs font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8 opacity-50" />
                    <p>No team members found</p>
                    {(searchQuery || roleFilter !== "all" || availabilityFilter !== "all") && (
                      <Button variant="link" size="sm" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => {
                const assignedTickets = mockTickets.filter(
                  (t) => t.assigneeId === member.id && t.status !== "delivered"
                ).length

                return (
                  <TableRow
                    key={member.id}
                    className="h-12 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    {/* Checkbox */}
                    <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedMembers)
                          if (checked) {
                            newSelected.add(member.id)
                          } else {
                            newSelected.delete(member.id)
                          }
                          setSelectedMembers(newSelected)
                        }}
                      />
                    </TableCell>

                    {/* Member Name with Avatar */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={() => router.push(`/creative/team/${member.id}`)}
                          >
                            {member.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role Badge */}
                    <TableCell className="py-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium px-1.5 py-0.5"
                      >
                        {WORKFLOW_ROLE_CONFIG[member.role].label}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {member.isAvailable ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs">Available</span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span className="text-xs text-muted-foreground">Unavailable</span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    {/* Workload with Bar */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <WorkloadBar
                            current={member.currentLoad}
                            max={member.maxCapacity}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap w-10 text-right">
                          {member.currentLoad}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Active Tickets */}
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {assignedTickets} active
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/creative/team/${member.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Message feature coming soon!")}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast.success("Remove feature coming soon!")}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Remove Member
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
    </PageContainer>
  )
}
