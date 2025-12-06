"use client"

import { cn } from "@/lib/utils"
import { Ticket, TicketStatus } from "@/types/creative"
import { KanbanColumn } from "./KanbanColumn"
import { useRef } from "react"

interface KanbanBoardProps {
  tickets: Ticket[]
  className?: string
  onScrollChange?: (showLeft: boolean, showRight: boolean) => void
}

const COLUMN_ORDER: TicketStatus[] = [
  "submitted",
  "assessment",
  "assigned",
  "production",
  "qa_review",
  "delivered",
]

export function KanbanBoard({ tickets, className, onScrollChange }: KanbanBoardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Group tickets by status
  const ticketsByStatus = COLUMN_ORDER.reduce((acc, status) => {
    acc[status] = tickets.filter((ticket) => ticket.status === status)
    return acc
  }, {} as Record<TicketStatus, Ticket[]>)

  // Handle scroll to notify parent
  const handleScroll = () => {
    if (!scrollContainerRef.current || !onScrollChange) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    const showLeft = scrollLeft > 0
    const showRight = scrollLeft < scrollWidth - clientWidth - 10
    onScrollChange(showLeft, showRight)
  }

  return (
    <div className={cn("mt-6", className)}>
      {/* Scrollable container - full width edge to edge */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin"
        style={{
          scrollSnapType: "x proximity",
        }}
      >
        <div className="flex gap-6 min-h-[calc(100vh-320px)] px-4 md:px-6">
          {COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={ticketsByStatus[status]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

