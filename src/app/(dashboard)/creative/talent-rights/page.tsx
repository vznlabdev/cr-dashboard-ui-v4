"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import { useTalentRights } from "@/contexts/talent-rights-context"
import { PageContainer } from "@/components/layout/PageContainer"
import { EmptyState } from "@/components/cr"
import { cn } from "@/lib/utils"
import type { TalentType, RightsStatus } from "@/types/talent-rights"
import { getDaysUntilInvitationExpires } from "@/lib/creator-utils"
import { downloadCSV, downloadJSON, prepareCreatorsForExport } from "@/lib/export-utils"
import { toast } from "sonner"

type ViewType = "grid" | "list"

export default function TalentRightsPage() {
  const router = useRouter()
  const {
    talentRights,
    invitations,
    inviteTalent,
    resendInvitation,
    revokeInvitation,
  } = useTalentRights()

  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<ViewType>("grid")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TalentType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<RightsStatus | "all">("all")

  // Filter talent
  const filteredTalent = useMemo(() => {
    return talentRights.filter((talent) => {
      const matchesSearch =
        talent.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (talent.talentRightsId || talent.creatorRightsId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || (talent.talentType || talent.creatorType) === typeFilter
      const matchesStatus = statusFilter === "all" || talent.rightsStatus === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [talentRights, searchQuery, typeFilter, statusFilter])

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
      if (filteredTalent.length === 0) {
        toast.error("No talent to export")
        return
      }

      const exportData = prepareCreatorsForExport(filteredTalent)
      const filename = `talent-rights-export-${new Date().toISOString().split("T")[0]}`

      if (format === "csv") {
        downloadCSV(exportData, filename)
        toast.success("Talent rights exported as CSV")
      } else {
        downloadJSON(exportData, filename)
        toast.success("Talent rights exported as JSON")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed")
    }
  }

  return (
    <PageContainer className="space-y-4 animate-fade-in">
      {/* Compact Header with Inline Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Talent Rights</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {filteredTalent.length} {filteredTalent.length === 1 ? 'talent' : 'talent'}
            {searchQuery && ' • filtered'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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
            size="sm"
            onClick={() => setInviteDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Talent
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

      {/* Search and Controls - Single Row Linear Style */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, TR ID, or email..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filters */}
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
          <SelectTrigger className="w-[150px] h-9">
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
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Authorized">Authorized</SelectItem>
            <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Segmented View Control */}
        <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
          <button
            onClick={() => setView('grid')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all duration-200",
              view === 'grid' 
                ? "bg-background shadow-sm text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all duration-200",
              view === 'list' 
                ? "bg-background shadow-sm text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
        
        {/* Clear search */}
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="h-9">
            Clear
          </Button>
        )}
      </div>

      {/* Talent Grid/List */}
      {filteredTalent.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No talent found"
          description={
            searchQuery
              ? "Try adjusting your search or filters"
              : "Get started by inviting talent to create their account"
          }
          action={
            !searchQuery
              ? {
                  label: "Invite Talent",
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
          {filteredTalent.map((talent) => (
            <CreatorCard key={talent.id} creator={talent} variant={view} />
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
