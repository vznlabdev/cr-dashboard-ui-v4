"use client"

import { cn } from "@/lib/utils"
import { TicketStatus, TICKET_STATUS_CONFIG } from "@/types/creative"

interface TicketStatusBadgeProps {
  status: TicketStatus
  size?: "sm" | "md" | "lg"
  showDot?: boolean
  className?: string
}

export function TicketStatusBadge({
  status,
  size = "md",
  showDot = true,
  className,
}: TicketStatusBadgeProps) {
  const config = TICKET_STATUS_CONFIG[status]

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  }

  const dotSizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        config.bgColor,
        config.color,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full",
            dotSizeClasses[size],
            status === "delivered" ? "bg-green-500" :
            status === "production" ? "bg-orange-500" :
            status === "qa_review" ? "bg-cyan-500" :
            status === "assigned" ? "bg-amber-500" :
            status === "assessment" ? "bg-purple-500" :
            "bg-blue-500"
          )}
        />
      )}
      {config.label}
    </span>
  )
}

