"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useSidebar } from "@/components/layout/sidebar-context"
import { KanbanBoard, TicketCard } from "@/components/creative"
import { mockTickets, getTicketCountByStatus } from "@/lib/mock-data/creative"
import { Ticket, TicketStatus } from "@/types/creative"
import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/layout/PageContainer"

type ViewMode = "kanban" | "list"

export default function TicketsPage() {
  const { collapsed } = useSidebar()
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [tickets] = useState<Ticket[]>(mockTickets)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

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
    { key: "all", label: "Board View", count: totalCount },
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
      <PageContainer className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage creative tasks and track progress
            </p>
          </div>
          <Link href="/creative/tickets/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Filter">
            <Filter className="h-4 w-4" />
          </Button>
          {/* Show grid/list view toggles only when filtering by specific status */}
          {selectedStatus !== "all" && (
            <>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("kanban")}
                title="Grid view"
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
            </>
          )}
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

        {/* Grid/List View - Stays in Container (shown when specific status is selected) */}
        {selectedStatus !== "all" && (
          <>
            {/* Grid View */}
            {viewMode === "kanban" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTickets.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No tasks found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search or filter"
                        : "No tasks in this status"}
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} variant="kanban" />
                  ))
                )}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-2">
                {filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No tasks found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try adjusting your search or filter"
                        : "No tasks in this status"}
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} variant="list" />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </PageContainer>

      {/* Kanban View - Full Width (shown when "All" is selected) */}
      {selectedStatus === "all" && (
        <div className="relative">
          <KanbanBoard 
            tickets={searchQuery ? filteredTickets : tickets}
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
