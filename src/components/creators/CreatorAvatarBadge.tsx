"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/format-utils"
import { formatCreatorExpiration } from "@/lib/creator-utils"
import type { Creator } from "@/types/creators"

interface CreatorAvatarBadgeProps {
  creator: Creator
  showName?: boolean
  size?: "sm" | "md"
  className?: string
}

export function CreatorAvatarBadge({
  creator,
  showName = false,
  size = "sm",
  className,
}: CreatorAvatarBadgeProps) {
  const avatarSize = size === "sm" ? "h-8 w-8" : "h-10 w-10"
  const statusDotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
  
  const getStatusColor = () => {
    switch (creator.rightsStatus) {
      case "Authorized":
        return "bg-green-500"
      case "Expiring Soon":
        return "bg-amber-500"
      case "Expired":
        return "bg-red-500"
      default:
        return "bg-muted-foreground"
    }
  }

  const tooltipText = `${creator.fullName}\n${creator.creatorRightsId}\n${formatCreatorExpiration(creator.validThrough)}`

  const avatarContent = (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(avatarSize, "ring-2 ring-background")}>
        <AvatarImage src={creator.avatarUrl} alt={creator.fullName} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
          {getInitials(creator.fullName)}
        </AvatarFallback>
      </Avatar>
      {/* Status indicator dot */}
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-background",
          statusDotSize,
          getStatusColor()
        )}
        aria-label={`Rights status: ${creator.rightsStatus}`}
      />
    </div>
  )

  if (showName) {
    return (
      <Link
        href={`/creative/creators/${creator.id}`}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        title={tooltipText}
      >
        {avatarContent}
        <span className="text-sm font-medium truncate max-w-[120px]">
          {creator.fullName}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/creative/creators/${creator.id}`}
      className="inline-block hover:opacity-80 transition-opacity"
      title={tooltipText}
    >
      {avatarContent}
    </Link>
  )
}

