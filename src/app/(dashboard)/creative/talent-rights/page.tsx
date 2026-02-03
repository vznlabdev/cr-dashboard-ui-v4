"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserPlus, Search, LayoutGrid, List, Mail, X, Download, ChevronDown, SlidersHorizontal, Plus, FileText } from "lucide-react"
import Link from "next/link"
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
  const [invitationsExpanded, setInvitationsExpanded] = useState(false)
  const [selectedView, setSelectedView] = useState<'all' | 'active' | 'expiring' | 'expired'>('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  const expiringCount = useMemo(() => 
    talentRights.filter(t => t.rightsStatus === "Expiring Soon").length,
    [talentRights]
  )

  const handleViewChange = (view: typeof selectedView) => {
    setSelectedView(view)
    if (view === 'all') {
      setStatusFilter('all')
    } else if (view === 'active') {
      setStatusFilter('Authorized')
    } else if (view === 'expiring') {
      setStatusFilter('Expiring Soon')
    } else if (view === 'expired') {
      setStatusFilter('Expired')
    }
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (typeFilter !== 'all') count++
    if (statusFilter !== 'all') count++
    return count
  }, [typeFilter, statusFilter])

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
      {/* Compact Header - Single Line */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Talent Rights</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {filteredTalent.length} active
            </Badge>
            {pendingInvitations.length > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {pendingInvitations.length} pending
                </Badge>
              </>
            )}
            {expiringCount > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                  {expiringCount} expiring
                </Badge>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            asChild
          >
            <Link href="/creative/talent-rights/contracts">
              <FileText className="mr-2 h-4 w-4" />
              Contracts
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-8" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Talent
          </Button>
        </div>
      </div>

      {/* Compact Pending Invitations - Collapsible */}
      {pendingInvitations.length > 0 && (
        <div className="border-b">
          <button
            onClick={() => setInvitationsExpanded(!invitationsExpanded)}
            className="flex items-center gap-2 text-sm w-full hover:bg-accent/50 px-3 py-2 rounded-lg transition-colors"
          >
            <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">{pendingInvitations.length} pending invitation{pendingInvitations.length !== 1 ? 's' : ''}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform ml-auto", invitationsExpanded && "rotate-180")} />
          </button>
          
          {invitationsExpanded && (
            <div className="pb-2 space-y-1 animate-in slide-in-from-top-2">
              {pendingInvitations.map((invitation) => {
                const daysLeft = getDaysUntilInvitationExpires(invitation)
                return (
                  <div key={invitation.id} className="flex items-center justify-between px-3 py-2 hover:bg-accent/50 rounded-lg text-sm transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-medium truncate">{invitation.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{invitation.email}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        • {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResendInvitation(invitation.id)
                        }}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRevokeInvitation(invitation.id)
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Shopify-Style View Tabs + Icon Toolbar */}
      <div className="flex items-center justify-between py-3 border-b">
        {/* Pill-style view tabs */}
        <div className="flex items-center gap-1">
          <Button
            variant={selectedView === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => handleViewChange('all')}
          >
            All
            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
              {talentRights.length}
            </Badge>
          </Button>
          <Button
            variant={selectedView === 'active' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => handleViewChange('active')}
          >
            Active
          </Button>
          <Button
            variant={selectedView === 'expiring' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => handleViewChange('expiring')}
          >
            Expiring
          </Button>
          <Button
            variant={selectedView === 'expired' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-full px-4"
            onClick={() => handleViewChange('expired')}
          >
            Expired
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
            <Link href="/creative/talent-rights/pipeline">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Icon toolbar on right */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <div className="flex items-center border rounded-md ml-2">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none border-r"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsible Search Bar */}
      {searchOpen && (
        <div className="flex items-center gap-2 py-2 border-b animate-in slide-in-from-top-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, TR ID, or email..."
              className="pl-9 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Collapsible Filters Panel */}
      {filtersOpen && (
        <Card className="animate-in slide-in-from-top-2">
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Real Person">Real Person</SelectItem>
                    <SelectItem value="Character">Character</SelectItem>
                    <SelectItem value="Brand Mascot">Brand Mascot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Authorized">Authorized</SelectItem>
                    <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setTypeFilter('all')
                setStatusFilter('all')
              }}>
                Clear filters
              </Button>
              <Button size="sm" onClick={() => setFiltersOpen(false)}>
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
