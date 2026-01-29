"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatTimeAgo } from "@/utils/time"
import { ActivityIcon } from "./ActivityIcon"
import type { InboxActivity } from "@/types"

interface ActivityListItemProps {
  activity: InboxActivity
  isSelected: boolean
  onClick: () => void
}

export function ActivityListItem({
  activity,
  isSelected,
  onClick,
}: ActivityListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 transition-all border-l-2",
        isSelected
          ? "bg-accent border-blue-500"
          : "border-transparent hover:bg-accent/50",
        !activity.read && "bg-accent/30"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Activity Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <ActivityIcon type={activity.type} size="sm" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                "text-sm leading-tight truncate",
                !activity.read && "font-semibold"
              )}
            >
              {activity.title}
            </h4>
            {!activity.read && (
              <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {activity.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px] bg-accent">
                {activity.actor.initials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{activity.actor.name}</span>
            <span>•</span>
            <span className="flex-shrink-0">
              {formatTimeAgo(activity.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
