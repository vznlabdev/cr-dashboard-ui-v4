"use client"

import { cn } from "@/lib/utils"
import { Ticket, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { TicketStatusBadge } from "./TicketStatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Paperclip,
} from "lucide-react"
import Link from "next/link"
import { getDesignTypeIcon } from "@/lib/design-icons"
import { getInitials, formatDateShort } from "@/lib/format-utils"

interface TicketCardProps {
  ticket: Ticket
  variant?: "kanban" | "list" | "compact"
  className?: string
  isDragging?: boolean
}

export function TicketCard({
  ticket,
  variant = "kanban",
  className,
  isDragging = false,
}: TicketCardProps) {
  const designType = DESIGN_TYPE_CONFIG[ticket.designType]
  const DesignIcon = getDesignTypeIcon(designType.iconName)

  // Calculate progress for production tickets
  const progress = ticket.status === "production" && ticket.estimatedHours
    ? Math.min((ticket.trackedTime / ticket.estimatedHours) * 100, 100)
    : null

  if (variant === "compact") {
    return (
      <Link href={`/creative/tickets/${ticket.id}`}>
        <Card
          className={cn(
            "p-3 hover:bg-accent/50 transition-colors cursor-pointer",
            isDragging && "shadow-lg",
            className
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate flex-1">{ticket.title}</span>
            <TicketStatusBadge status={ticket.status} size="sm" showDot={false} />
          </div>
        </Card>
      </Link>
    )
  }

  if (variant === "list") {
    return (
      <Link href={`/creative/tickets/${ticket.id}`}>
        <Card
          className={cn(
            "py-0 hover:bg-accent/50 transition-colors cursor-pointer",
            isDragging && "shadow-lg",
            className
          )}
        >
          <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <DesignIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium truncate">{ticket.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {ticket.brandLogoUrl && (
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={ticket.brandLogoUrl} alt={ticket.brandName} />
                      <AvatarFallback className="text-[8px]" style={{ backgroundColor: ticket.brandColor }}>
                        {ticket.brandName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>{ticket.brandName}</span>
                </div>
                <span>•</span>
                <span>{designType.label}</span>
              </div>
            </div>

            {/* Status */}
            <TicketStatusBadge status={ticket.status} size="sm" />

            {/* Assignee */}
            {ticket.assigneeName ? (
              <Avatar className="h-7 w-7">
                <AvatarImage src={ticket.assigneeAvatar} alt={ticket.assigneeName} />
                <AvatarFallback className="text-xs bg-muted">
                  {getInitials(ticket.assigneeName)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-7 w-7 rounded-full border border-dashed border-muted-foreground/30" />
            )}

            {/* Due Date */}
            {ticket.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDateShort(ticket.dueDate)}
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Kanban variant (default) - Minimal design
  return (
    <Link href={`/creative/tickets/${ticket.id}`}>
      <Card
        className={cn(
          "py-0 transition-all duration-200 cursor-pointer group",
          "bg-card hover:bg-accent/30 hover:shadow-lg hover:-translate-y-0.5",
          "border border-border shadow-sm",
          isDragging && "shadow-xl ring-2 ring-primary/40 scale-105",
          className
        )}
      >
        <CardContent className="p-4">
        {/* Header: Brand + Priority */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {ticket.brandLogoUrl && (
              <Avatar className="h-5 w-5 shrink-0 ring-1 ring-border/40">
                <AvatarImage src={ticket.brandLogoUrl} alt={ticket.brandName} />
                <AvatarFallback className="text-[9px]" style={{ backgroundColor: ticket.brandColor }}>
                  {ticket.brandName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-xs text-muted-foreground truncate font-medium">
              {ticket.brandName}
            </span>
          </div>
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0",
            ticket.priority === "urgent" && "bg-red-500/20 text-red-700 dark:text-red-400",
            ticket.priority === "high" && "bg-orange-500/20 text-orange-700 dark:text-orange-400",
            ticket.priority === "medium" && "bg-blue-500/20 text-blue-700 dark:text-blue-400",
            ticket.priority === "low" && "bg-slate-500/20 text-slate-600 dark:text-slate-400",
          )}>
            {ticket.priority === "urgent" && "URGENT"}
            {ticket.priority === "high" && "HIGH"}
            {ticket.priority === "medium" && "MED"}
            {ticket.priority === "low" && "LOW"}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm mb-2.5 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {ticket.title}
        </h3>

        {/* Design Type */}
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <DesignIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium">{designType.label}</span>
        </div>

        {/* Progress Bar (for production tickets) */}
        {progress !== null && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
          {/* Assignee */}
          {ticket.assigneeName ? (
            <Avatar className="h-6 w-6 ring-2 ring-background">
              <AvatarImage src={ticket.assigneeAvatar} alt={ticket.assigneeName} />
              <AvatarFallback className="text-[10px] bg-muted font-medium">
                {getInitials(ticket.assigneeName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30" />
          )}

          {/* Meta info */}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            {ticket.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium">{ticket.comments.length}</span>
              </div>
            )}

            {(ticket.attachments.length > 0 || ticket.versions.length > 0) && (
              <div className="flex items-center gap-1 text-xs">
                <Paperclip className="h-3.5 w-3.5" />
                <span className="font-medium">{ticket.attachments.length + ticket.versions.length}</span>
              </div>
            )}

            {ticket.dueDate && (
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">{formatDateShort(ticket.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
        </CardContent>
      </Card>
    </Link>
  )
}
