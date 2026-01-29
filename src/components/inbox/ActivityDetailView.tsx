"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatTimeAgo } from "@/utils/time"
import { ActivityIcon } from "./ActivityIcon"
import { Archive, ArrowRight, Check, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { InboxActivity } from "@/types"

interface ActivityDetailViewProps {
  activity: InboxActivity
  onMarkAsRead: (id: string) => void
  onArchive: (id: string) => void
}

// Activity type labels for badges
const activityTypeLabels: Record<InboxActivity['type'], string> = {
  mention: 'Mention',
  task_assigned: 'Assignment',
  task_status: 'Status Change',
  project_update: 'Project Update',
  comment: 'Comment',
  asset_approved: 'Approval',
  asset_rejected: 'Rejection',
  clearance_needed: 'Action Required',
  team_invite: 'Team Invite',
  deadline_approaching: 'Deadline',
}

export function ActivityDetailView({
  activity,
  onMarkAsRead,
  onArchive,
}: ActivityDetailViewProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header with actor info */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm bg-accent">
                {activity.actor.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{activity.actor.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
          
          {/* Type badge */}
          <Badge variant="outline" className="gap-1">
            <ActivityIcon type={activity.type} size="sm" />
            {activityTypeLabels[activity.type]}
          </Badge>
        </div>

        {/* Activity title and description */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{activity.title}</h2>
          <p className="text-muted-foreground">{activity.description}</p>
        </div>

        {/* Context cards */}
        <div className="space-y-3 mb-6">
          {/* Project context */}
          {activity.project && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Project</p>
                    <p className="font-medium">{activity.project.name}</p>
                  </div>
                  <Link href={`/projects/${activity.project.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task context */}
          {activity.task && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Task</p>
                    <p className="font-medium">{activity.task.title}</p>
                    {activity.task.status && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {activity.task.status}
                      </Badge>
                    )}
                  </div>
                  <Link
                    href={`/projects/${activity.project?.id}/tasks/${activity.task.id}`}
                  >
                    <Button variant="ghost" size="sm" className="gap-1">
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Asset context */}
          {activity.asset && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Asset</p>
                    <p className="font-medium font-mono text-sm">
                      {activity.asset.name}
                    </p>
                  </div>
                  <Link href={`/creative/assets`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata context (feedback, comment text, etc.) */}
          {activity.metadata.commentText && (
            <Card className="bg-accent/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Comment</p>
                <p className="text-sm">{activity.metadata.commentText}</p>
              </CardContent>
            </Card>
          )}

          {activity.metadata.feedback && (
            <Card className="bg-accent/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Feedback</p>
                <p className="text-sm">{activity.metadata.feedback}</p>
              </CardContent>
            </Card>
          )}

          {activity.metadata.oldStatus && activity.metadata.newStatus && (
            <Card className="bg-accent/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Status Change</p>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{activity.metadata.oldStatus}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{activity.metadata.newStatus}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pb-6 border-b border-border">
          {activity.primaryAction && (
            <Link href={activity.primaryAction.href || '#'}>
              <Button variant={activity.primaryAction.variant || 'default'}>
                {activity.primaryAction.label}
              </Button>
            </Link>
          )}
          
          {activity.secondaryActions?.map((action, idx) => (
            <Link key={idx} href={action.href || '#'}>
              <Button variant={action.variant || 'outline'}>
                {action.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-6">
          {!activity.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(activity.id)}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Mark as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(activity.id)}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>
    </div>
  )
}
