"use client"

import { cn } from "@/lib/utils"
import { Ticket, DESIGN_TYPE_CONFIG, PRIORITY_CONFIG } from "@/types/creative"
import { TicketStatusBadge } from "./TicketStatusBadge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Paperclip,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

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
  const priority = PRIORITY_CONFIG[ticket.priority]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== "delivered"

  if (variant === "compact") {
    return (
      <Link href={`/creative/tickets/${ticket.id}`}>
        <Card
          className={cn(
            "p-3 hover:shadow-md transition-all cursor-pointer border-l-4",
            isDragging && "shadow-lg rotate-2 scale-105",
            className
          )}
          style={{ borderLeftColor: ticket.brandColor || "#3b82f6" }}
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
            "p-4 hover:shadow-md transition-all cursor-pointer",
            isDragging && "shadow-lg",
            className
          )}
        >
          <div className="flex items-center gap-4">
            {/* Brand Color Bar */}
            <div
              className="w-1 h-12 rounded-full shrink-0"
              style={{ backgroundColor: ticket.brandColor || "#3b82f6" }}
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{designType.icon}</span>
                <h3 className="font-medium truncate">{ticket.title}</h3>
                {ticket.priority === "urgent" && (
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{ticket.brandName}</span>
                <span>•</span>
                <span>{designType.label}</span>
              </div>
            </div>

            {/* Status */}
            <TicketStatusBadge status={ticket.status} size="sm" />

            {/* Assignee */}
            {ticket.assigneeName ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10">
                  {getInitials(ticket.assigneeName)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30" />
            )}

            {/* Due Date */}
            {ticket.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-red-500" : "text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatDate(ticket.dueDate)}
              </div>
            )}
          </div>
        </Card>
      </Link>
    )
  }

  // Kanban variant (default)
  return (
    <Link href={`/creative/tickets/${ticket.id}`}>
      <Card
        className={cn(
          "p-3 hover:shadow-md transition-all cursor-pointer group",
          isDragging && "shadow-lg rotate-1 scale-[1.02]",
          isOverdue && "ring-1 ring-red-500/50",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: ticket.brandColor || "#3b82f6" }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {ticket.brandName}
            </span>
          </div>
          {ticket.priority === "urgent" && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded", priority.bgColor, priority.color)}>
              Urgent
            </span>
          )}
          {ticket.priority === "high" && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded", priority.bgColor, priority.color)}>
              High
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {ticket.title}
        </h3>

        {/* Design Type */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm">{designType.icon}</span>
          <span className="text-xs text-muted-foreground">{designType.label}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {/* Left: Assignee */}
          <div className="flex items-center gap-2">
            {ticket.assigneeName ? (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10">
                  {getInitials(ticket.assigneeName)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30" />
            )}
          </div>

          {/* Right: Meta info */}
          <div className="flex items-center gap-3 text-muted-foreground">
            {/* Comments count */}
            {ticket.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{ticket.comments.length}</span>
              </div>
            )}

            {/* Attachments count */}
            {(ticket.attachments.length > 0 || ticket.versions.length > 0) && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span className="text-xs">
                  {ticket.attachments.length + ticket.versions.length}
                </span>
              </div>
            )}

            {/* Due date */}
            {ticket.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  isOverdue ? "text-red-500" : ""
                )}
              >
                <Clock className="h-3 w-3" />
                <span className="text-xs">{formatDate(ticket.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

