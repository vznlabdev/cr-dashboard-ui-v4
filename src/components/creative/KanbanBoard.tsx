"use client"

import { cn } from "@/lib/utils"
import { Ticket, TicketStatus } from "@/types/creative"
import { KanbanColumn } from "./KanbanColumn"

interface KanbanBoardProps {
  tickets: Ticket[]
  className?: string
}

const COLUMN_ORDER: TicketStatus[] = [
  "submitted",
  "assessment",
  "assigned",
  "production",
  "qa_review",
  "delivered",
]

export function KanbanBoard({ tickets, className }: KanbanBoardProps) {
  // Group tickets by status
  const ticketsByStatus = COLUMN_ORDER.reduce((acc, status) => {
    acc[status] = tickets.filter((ticket) => ticket.status === status)
    return acc
  }, {} as Record<TicketStatus, Ticket[]>)

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex gap-4 pb-4 min-h-[calc(100vh-300px)]">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={ticketsByStatus[status]}
          />
        ))}
      </div>
    </div>
  )
}

