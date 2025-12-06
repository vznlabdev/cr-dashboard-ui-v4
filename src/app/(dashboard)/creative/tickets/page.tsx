"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useWorkspace } from "@/contexts/workspace-context"
import { useSidebar } from "@/components/layout/sidebar-context"
import { KanbanBoard, TicketCard } from "@/components/creative"
import { mockTickets, getTicketCountByStatus } from "@/lib/mock-data/creative"
import { Ticket, TicketStatus } from "@/types/creative"
import { cn } from "@/lib/utils"

type ViewMode = "kanban" | "list"

export default function TicketsPage() {
  const { setWorkspace } = useWorkspace()
  const { collapsed } = useSidebar()
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [tickets] = useState<Ticket[]>(mockTickets)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  useEffect(() => {
    setWorkspace("creative")
  }, [setWorkspace])

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus
    const matchesSearch =
      searchQuery === "" ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusCounts = getTicketCountByStatus()
  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  const statusTabs: { key: TicketStatus | "all"; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalCount },
    { key: "submitted", label: "Submitted", count: statusCounts.submitted },
    { key: "assessment", label: "Assessment", count: statusCounts.assessment },
    { key: "assigned", label: "Assigned", count: statusCounts.assigned },
    { key: "production", label: "Production", count: statusCounts.production },
    { key: "qa_review", label: "QA Review", count: statusCounts.qa_review },
    { key: "delivered", label: "Delivered", count: statusCounts.delivered },
  ]

  return (
    <>
      {/* Header and Filters - Contained */}
      <div className="space-y-6 animate-fade-in mx-auto max-w-7xl w-full">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage creative requests and track progress
            </p>
          </div>
          <Link href="/creative/tickets/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("kanban")}
              title="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <Badge
              key={tab.key}
              variant={selectedStatus === tab.key ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedStatus === tab.key
                  ? ""
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => setSelectedStatus(tab.key)}
            >
              {tab.label} ({tab.count})
            </Badge>
          ))}
        </div>

        {/* List View - Stays in Container */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No tickets found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search or filter"
                    : "Create a new request to get started"}
                </p>
                {!searchQuery && (
                  <Link href="/creative/tickets/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Request
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} variant="list" />
              ))
            )}
          </div>
        )}
      </div>

      {/* Kanban View - Full Width with edge gradients */}
      {viewMode === "kanban" && (
        <div className="relative">
          {/* Left fade indicator at viewport edge */}
          {showLeftFade && (
            <div 
              className={cn(
                "fixed left-0 top-16 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none",
                "md:left-60",
                collapsed && "md:left-16"
              )}
            />
          )}
          
          {/* Right fade indicator at viewport edge */}
          {showRightFade && (
            <div className="fixed right-0 top-16 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
          )}

          <KanbanBoard 
            tickets={selectedStatus === "all" ? tickets : filteredTickets}
            onScrollChange={(showLeft, showRight) => {
              setShowLeftFade(showLeft)
              setShowRightFade(showRight)
            }}
          />
        </div>
      )}
    </>
  )
}
