"use client"

import { cn } from "@/lib/utils"

interface ActivityItemProps {
  user: {
    name: string
    avatar?: string
    initials: string
    color: string
  }
  action: string
  timestamp: string
  className?: string
}

export function ActivityItem({ user, action, timestamp, className }: ActivityItemProps) {
  return (
    <div className={cn("flex items-start gap-3 py-3", className)}>
      {/* User Avatar */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
        style={{ backgroundColor: user.color }}
      >
        {user.initials}
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">{user.name}</span>{" "}
          <span className="text-muted-foreground">{action}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{timestamp}</p>
      </div>
    </div>
  )
}
