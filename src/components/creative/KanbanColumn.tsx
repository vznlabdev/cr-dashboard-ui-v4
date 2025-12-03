"use client"

import { cn } from "@/lib/utils"
import { Ticket, TicketStatus, TICKET_STATUS_CONFIG } from "@/types/creative"
import { TicketCard } from "./TicketCard"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        "flex flex-col min-w-[300px] max-w-[300px] rounded-lg bg-muted/30",
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/40">
        <h3 className="font-medium text-sm text-foreground/80">{config.label}</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {tickets.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex flex-col gap-4 flex-1 p-3 overflow-y-auto max-h-[calc(100vh-350px)]">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-sm text-muted-foreground/60 border border-dashed border-border/50 rounded-lg">
            <span>No tickets</span>
            {status === "submitted" && (
              <Link href="/creative/tickets/new" className="mt-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </Link>
            )}
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} variant="kanban" />
          ))
        )}
      </div>
    </div>
  )
}
