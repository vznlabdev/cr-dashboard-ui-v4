"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, Search, LayoutGrid, List, Mail, X, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { CreatorCard, InviteCreatorDialog } from "@/components/creators"
import { useCreators } from "@/contexts/creators-context"
import { PageContainer } from "@/components/layout/PageContainer"
import { EmptyState } from "@/components/cr"
import { cn } from "@/lib/utils"
import type { CreatorType, RightsStatus } from "@/types/creators"
import { getDaysUntilInvitationExpires } from "@/lib/creator-utils"
import { downloadCSV, downloadJSON, prepareCreatorsForExport } from "@/lib/export-utils"
import { toast } from "sonner"

type ViewType = "grid" | "list"

export default function CreatorsPage() {
  const {
    creators,
    invitations,
    inviteCreator,
    resendInvitation,
    revokeInvitation,
  } = useCreators()

  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<ViewType>("grid")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<CreatorType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<RightsStatus | "all">("all")
  const [invitationStatusFilter, setInvitationStatusFilter] = useState<
    "all" | "pending" | "accepted" | "expired"
  >("all")

  // Filter creators
  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesSearch =
        creator.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.creatorRightsId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || creator.creatorType === typeFilter
      const matchesStatus = statusFilter === "all" || creator.rightsStatus === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [creators, searchQuery, typeFilter, statusFilter])

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    if (invitationStatusFilter === "all") return invitations
    return invitations.filter((inv) => inv.status === invitationStatusFilter)
  }, [invitations, invitationStatusFilter])

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending")

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId)
    } catch (error) {
      // Error handled in context
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await revokeInvitation(invitationId)
    } catch (error) {
      // Error handled in context
    }
  }

  const handleExport = (format: "csv" | "json") => {
    try {
      if (filteredCreators.length === 0) {
        toast.error("No creators to export")
        return
      }

      const exportData = prepareCreatorsForExport(filteredCreators)
      const filename = `creators-export-${new Date().toISOString().split("T")[0]}`

      if (format === "csv") {
        downloadCSV(exportData, filename)
        toast.success("Creators exported as CSV")
      } else {
        downloadJSON(exportData, filename)
        toast.success("Creators exported as JSON")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed")
    }
  }

  return (
    <PageContainer className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Creators</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage creator rights and creator accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setInviteDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Creator
          </Button>
        </div>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Pending Invitations</h3>
                <Badge variant="secondary">{pendingInvitations.length}</Badge>
              </div>
              <div className="space-y-2">
                {pendingInvitations.map((invitation) => {
                  const daysLeft = getDaysUntilInvitationExpires(invitation)
                  return (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{invitation.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {invitation.email}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {daysLeft > 0
                            ? `Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                            : "Expired"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvitation(invitation.id)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvitation(invitation.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, CR ID, or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Real Person">Real Person</SelectItem>
                <SelectItem value="Character">Character</SelectItem>
                <SelectItem value="Brand Mascot">Brand Mascot</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Authorized">Authorized</SelectItem>
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
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
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {filteredCreators.length} creator{filteredCreators.length !== 1 ? "s" : ""}
        </span>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-auto py-1 px-2"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Creators Grid/List */}
      {filteredCreators.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No creators found"
          description={
            searchQuery
              ? "Try adjusting your search or filters"
              : "Get started by inviting a creator to create their account"
          }
          action={
            !searchQuery
              ? {
                  label: "Invite Creator",
                  onClick: () => setInviteDialogOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div
          className={cn(
            view === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-3"
          )}
        >
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} variant={view} />
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <InviteCreatorDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </PageContainer>
  )
}

