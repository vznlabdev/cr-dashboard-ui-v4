"use client"

import { cn } from "@/lib/utils"
import { Ticket, DESIGN_TYPE_CONFIG } from "@/types/creative"
import { TicketStatusBadge } from "./TicketStatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Paperclip,
  Zap,
  Target,
} from "lucide-react"
import Link from "next/link"
import { getDesignTypeIcon } from "@/lib/design-icons"
import { getInitials, formatDateShort } from "@/lib/format-utils"
import { useState } from "react"

// Intended use color mapping
const INTENDED_USE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Advertising/Campaigns": { 
    bg: "bg-red-50 dark:bg-red-900/20", 
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800"
  },
  "Editorial": { 
    bg: "bg-blue-50 dark:bg-blue-900/20", 
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800"
  },
  "Internal": { 
    bg: "bg-gray-50 dark:bg-gray-900/20", 
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800"
  },
  "Social Media": { 
    bg: "bg-purple-50 dark:bg-purple-900/20", 
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800"
  },
  "Print": { 
    bg: "bg-emerald-50 dark:bg-emerald-900/20", 
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800"
  },
  "Web": { 
    bg: "bg-cyan-50 dark:bg-cyan-900/20", 
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800"
  },
  "Video": { 
    bg: "bg-pink-50 dark:bg-pink-900/20", 
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800"
  },
}

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
  const [isHovering, setIsHovering] = useState(false)
  const designType = DESIGN_TYPE_CONFIG[ticket.designType]
  const DesignIcon = getDesignTypeIcon(designType.iconName)

  // Calculate progress for production tickets
  const progress = ticket.status === "production" && ticket.estimatedHours
    ? Math.min((ticket.trackedTime / ticket.estimatedHours) * 100, 100)
    : null

  // Get intended use color
  const getIntendedUseStyle = (use: string) => {
    return INTENDED_USE_COLORS[use] || INTENDED_USE_COLORS["Internal"]
  }

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
                {/* Mode Badge */}
                {ticket.mode && ticket.mode !== "manual" && (
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold px-1.5 py-0 gap-0.5",
                      ticket.mode === "generative" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                      ticket.mode === "assisted" && "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    )}
                  >
                    <Zap className="h-2 w-2" />
                    {ticket.mode === "generative" ? "AI Gen" : "AI Assist"}
                  </Badge>
                )}
                <DesignIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium truncate">{ticket.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
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
                <span>{ticket.deliverableType || designType.label}</span>
                {/* Intended Uses */}
                {ticket.intendedUses && ticket.intendedUses.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{ticket.intendedUses.slice(0, 2).join(", ")}</span>
                    {ticket.intendedUses.length > 2 && (
                      <span className="font-medium">+{ticket.intendedUses.length - 2}</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Priority Badge */}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold shrink-0",
                ticket.priority === "urgent" && "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
                ticket.priority === "high" && "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
                ticket.priority === "medium" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                ticket.priority === "low" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
              )}
            >
              {ticket.priority === "urgent" && "URGENT"}
              {ticket.priority === "high" && "HIGH"}
              {ticket.priority === "medium" && "MED"}
              {ticket.priority === "low" && "LOW"}
            </Badge>

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
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
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
            ticket.priority === "urgent" && "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
            ticket.priority === "high" && "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
            ticket.priority === "medium" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
            ticket.priority === "low" && "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800",
          )}>
            {ticket.priority === "urgent" && "URGENT"}
            {ticket.priority === "high" && "HIGH"}
            {ticket.priority === "medium" && "MED"}
            {ticket.priority === "low" && "LOW"}
          </span>
        </div>

        {/* Mode Indicator */}
        {ticket.mode && ticket.mode !== "manual" && (
          <div className="mb-2.5">
            <Badge 
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 gap-1",
                ticket.mode === "generative" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                ticket.mode === "assisted" && "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
              )}
            >
              <Zap className="h-2.5 w-2.5" />
              {ticket.mode === "generative" ? "AI Gen" : "AI Assist"}
            </Badge>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-sm mb-2.5 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {ticket.title}
        </h3>

        {/* Design Type / Deliverable Type */}
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <DesignIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium">{ticket.deliverableType || designType.label}</span>
        </div>

        {/* Intended Uses */}
        {ticket.intendedUses && ticket.intendedUses.length > 0 && (
          <div className="mb-3">
            {isHovering ? (
              // Show all on hover
              <div className="flex flex-wrap items-center gap-1.5">
                <Target className="h-3 w-3 text-muted-foreground shrink-0" />
                {ticket.intendedUses.map((use) => {
                  const style = getIntendedUseStyle(use)
                  return (
                    <Badge
                      key={use}
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0",
                        style.bg,
                        style.text,
                        style.border
                      )}
                    >
                      {use}
                    </Badge>
                  )
                })}
              </div>
            ) : (
              // Show first 2 + count
              <div className="flex flex-wrap items-center gap-1.5">
                <Target className="h-3 w-3 text-muted-foreground shrink-0" />
                {ticket.intendedUses.slice(0, 2).map((use) => {
                  const style = getIntendedUseStyle(use)
                  return (
                    <Badge
                      key={use}
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0",
                        style.bg,
                        style.text,
                        style.border
                      )}
                    >
                      {use}
                    </Badge>
                  )
                })}
                {ticket.intendedUses.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium px-1.5 py-0 bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                  >
                    +{ticket.intendedUses.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Project Tag / Group */}
        {ticket.projectTag && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-[10px] font-medium">
              {ticket.projectTag}
            </Badge>
          </div>
        )}

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
