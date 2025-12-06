"use client"

import { cn } from "@/lib/utils"
import { Ticket, TicketStatus, TICKET_STATUS_CONFIG } from "@/types/creative"
import { TicketCard } from "./TicketCard"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

interface KanbanColumnProps {
  status: TicketStatus
  tickets: Ticket[]
  className?: string
}

export function KanbanColumn({ status, tickets, className }: KanbanColumnProps) {
  const config = TICKET_STATUS_CONFIG[status]
  const contentRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // Detect scroll for header shadow
  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    const handleScroll = () => {
      setIsScrolled(content.scrollTop > 0)
    }

    content.addEventListener("scroll", handleScroll)
    return () => content.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col min-w-[320px] max-w-[320px] rounded-lg bg-muted/30 border border-border/30",
        "scroll-snap-align-start",
        className
      )}
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Column Header - Sticky */}
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-muted/30 rounded-t-lg border-b border-border/30",
          "transition-shadow duration-200",
          isScrolled && "shadow-md"
        )}
      >
        <h3 className="font-semibold text-sm text-foreground">{config.label}</h3>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            config.bgColor,
            config.color
          )}>
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={contentRef}
        className="flex flex-col gap-3 flex-1 p-3 overflow-y-auto max-h-[calc(100vh-360px)] scrollbar-thin"
      >
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground/60 border-2 border-dashed border-border/40 rounded-lg bg-card/50">
            <span className="text-xs">No tickets</span>
            {status === "submitted" && (
              <Link href="/creative/tickets/new" className="mt-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
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
