"use client"

import { cn } from "@/lib/utils"
import { Ticket, TicketStatus, TICKET_STATUS_CONFIG } from "@/types/creative"
import { TicketCard } from "./TicketCard"

interface KanbanColumnProps {
  status: TicketStatus
  tickets: Ticket[]
  className?: string
}

export function KanbanColumn({ status, tickets, className }: KanbanColumnProps) {
  const config = TICKET_STATUS_CONFIG[status]

  return (
    <div
      className={cn(
        "flex flex-col min-w-[300px] max-w-[300px] bg-muted/30 rounded-lg",
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              status === "delivered" ? "bg-green-500" :
              status === "production" ? "bg-orange-500" :
              status === "qa_review" ? "bg-cyan-500" :
              status === "assigned" ? "bg-amber-500" :
              status === "assessment" ? "bg-purple-500" :
              "bg-blue-500"
            )}
          />
          <h3 className="font-medium text-sm">{config.label}</h3>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-350px)]">
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              No tickets
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} variant="kanban" />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

