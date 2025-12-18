"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, CheckCircle2, Clock, AlertCircle, User } from "lucide-react"
import type { Creator } from "@/types/creators"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/format-utils"
import { getRightsStatusColor, getRightsStatusVariant, formatCreatorExpiration } from "@/lib/creator-utils"

interface CreatorCardProps {
  creator: Creator
  variant?: "grid" | "list"
  className?: string
  onClick?: () => void
}

export function CreatorCard({ 
  creator, 
  variant = "grid",
  className, 
  onClick 
}: CreatorCardProps) {
  const getInitialsFromName = (name: string) => {
    return getInitials(creator.fullName)
  }

  const getStatusIcon = () => {
    switch (creator.rightsStatus) {
      case "Authorized":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      case "Expiring Soon":
        return <Clock className="h-4 w-4 text-amber-500 shrink-0" />
      case "Expired":
        return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
      default:
        return null
    }
  }

  const totalCredits = creator.linkedAssetsCount + creator.linkedProjectsCount

  if (variant === "list") {
    const cardContent = (
      <Card className="hover:shadow-md transition-all hover:border-primary/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={creator.avatarUrl} alt={creator.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitialsFromName(creator.fullName)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{creator.fullName}</h3>
                {getStatusIcon()}
              </div>
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{creator.email}</span>
              </p>
            </div>

            {/* Creator Type */}
            <Badge variant="secondary" className="text-xs">
              {creator.creatorType}
            </Badge>

            {/* Credits */}
            <div className="text-center w-20">
              <p className="text-lg font-semibold">{totalCredits}</p>
              <p className="text-xs text-muted-foreground">credits</p>
            </div>

            {/* Rights Status */}
            <Badge 
              variant={getRightsStatusVariant(creator.rightsStatus)}
              className="text-xs"
            >
              {creator.rightsStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )

    if (onClick) {
      return (
        <div onClick={onClick} className={cn("cursor-pointer", className)}>
          {cardContent}
        </div>
      )
    }

    return (
      <Link href={`/creative/creators/${creator.id}`} className={cn("block", className)}>
        {cardContent}
      </Link>
    )
  }

  // Grid variant (default)
  const cardContent = (
    <Card className="group hover:shadow-lg transition-all hover:border-primary/50 hover:-translate-y-1 py-0">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={creator.avatarUrl} alt={creator.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {getInitialsFromName(creator.fullName)}
            </AvatarFallback>
          </Avatar>
          <Badge 
            variant={getRightsStatusVariant(creator.rightsStatus)}
            className={cn(
              "text-xs py-0 h-5",
              creator.rightsStatus === "Authorized"
                ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                : creator.rightsStatus === "Expiring Soon"
                ? "text-amber-600 border-amber-500/30 bg-amber-500/10"
                : "text-destructive border-destructive/30 bg-destructive/10"
            )}
          >
            {creator.rightsStatus}
          </Badge>
        </div>

        {/* Name & Email */}
        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
          {creator.fullName}
        </h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Mail className="h-3 w-3" />
          <span className="truncate">{creator.email}</span>
        </p>

        {/* Creator Type */}
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            {creator.creatorType}
          </Badge>
        </div>

        {/* CR ID & Credits */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
            {creator.creatorRightsId}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {totalCredits} credits
          </Badge>
          {creator.registrationSource === "invited" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Invited
            </Badge>
          )}
        </div>

        {/* Profile Completion / Expiration */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Profile</span>
            <span className="text-xs font-medium">{creator.profileCompletion}% complete</span>
          </div>
          <div className="w-full rounded-full bg-muted/50 h-1.5">
            <div
              className="rounded-full h-1.5 bg-primary transition-all duration-300"
              style={{ width: `${creator.profileCompletion}%` }}
            />
          </div>
          <p className={cn(
            "text-xs mt-2 font-medium",
            getRightsStatusColor(creator.rightsStatus)
          )}>
            {formatCreatorExpiration(creator.validThrough)}
          </p>
        </div>
      </CardContent>
    </Card>
  )

  if (onClick) {
    return (
      <div onClick={onClick} className={cn("cursor-pointer", className)}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/creative/creators/${creator.id}`} className={cn("block", className)}>
      {cardContent}
    </Link>
  )
}

