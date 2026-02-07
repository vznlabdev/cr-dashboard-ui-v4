"use client"

import { useMemo } from "react"
import { format, isSameDay } from "date-fns"
import {
  Upload,
  Send,
  UserCheck,
  ShieldCheck,
  XCircle,
  Search,
  MessageSquare,
  Palette,
  FileText,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Asset, AssetVersion, AssetVersionGroup, VersionComment } from "@/types/creative"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EventType =
  | "upload"
  | "submitted"
  | "client_review"
  | "approved"
  | "rejected"
  | "quality_check"
  | "comment"
  | "brand_change"
  | "version_notes"
  | "metadata"
  | "tag"
  | "design_type"
  | "content_type"
  | "task_link"
  | "check_initiated"

interface TimelineEvent {
  id: string
  date: Date
  title: string
  description?: string
  actor?: string
  type: EventType
}

// ---------------------------------------------------------------------------
// Dot colour per event type
// ---------------------------------------------------------------------------

const DOT_COLORS: Record<EventType, string> = {
  upload: "bg-blue-500",
  submitted: "bg-indigo-500",
  client_review: "bg-violet-500",
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
  quality_check: "bg-amber-500",
  comment: "bg-gray-400",
  brand_change: "bg-purple-500",
  version_notes: "bg-sky-400",
  metadata: "bg-slate-400",
  tag: "bg-teal-500",
  design_type: "bg-pink-500",
  content_type: "bg-orange-500",
  task_link: "bg-cyan-500",
  check_initiated: "bg-amber-400",
}

const EVENT_ICONS: Record<EventType, React.ComponentType<{ className?: string }>> = {
  upload: Upload,
  submitted: Send,
  client_review: UserCheck,
  approved: ShieldCheck,
  rejected: XCircle,
  quality_check: Search,
  comment: MessageSquare,
  brand_change: Palette,
  version_notes: FileText,
  metadata: FileText,
  tag: FileText,
  design_type: Palette,
  content_type: FileText,
  task_link: FileText,
  check_initiated: Search,
}

// ---------------------------------------------------------------------------
// Build timeline events from asset / version data
// ---------------------------------------------------------------------------

function pushIfDate(events: TimelineEvent[], date: Date | undefined | null, rest: Omit<TimelineEvent, "id" | "date"> & { id?: string }) {
  if (!date) return
  events.push({ id: rest.id ?? `${rest.type}-${date.getTime()}`, date, ...rest } as TimelineEvent)
}

function buildTimelineEvents(
  asset: Asset | AssetVersion | (Asset & Partial<AssetVersion>),
  versionGroup?: AssetVersionGroup | null,
): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const isVersion = "versionNumber" in asset && asset.versionNumber != null

  // 1. Created / Uploaded
  const uploadDate = isVersion ? (asset as AssetVersion).uploadedAt : (asset as Asset).createdAt
  pushIfDate(events, uploadDate, {
    title: isVersion
      ? `Version ${(asset as AssetVersion).versionNumber} uploaded`
      : "Asset created",
    actor: (asset as any).uploadedByName,
    type: "upload",
  })

  // 2. Version change notes (shown as event at upload time + 1ms to sort after upload)
  if (isVersion && (asset as AssetVersion).changeNotes) {
    const base = (asset as AssetVersion).uploadedAt
    if (base) {
      events.push({
        id: `version-notes-${asset.id}`,
        date: new Date(base.getTime() + 1),
        title: "Version notes",
        description: (asset as AssetVersion).changeNotes,
        type: "version_notes",
      })
    }
  }

  // 3. Submitted for review
  if (isVersion) {
    pushIfDate(events, (asset as AssetVersion).submittedAt, {
      title: "Submitted for review",
      actor: (asset as any).uploadedByName,
      type: "submitted",
    })
  }

  // 4. Client reviewed
  if (isVersion) {
    pushIfDate(events, (asset as AssetVersion).clientReviewedAt, {
      title: "Client review completed",
      actor: (asset as AssetVersion).clientReviewedBy,
      type: "client_review",
    })
  }

  // 5. Admin approved
  if (isVersion && (asset as AssetVersion).adminApprovedAt) {
    pushIfDate(events, (asset as AssetVersion).adminApprovedAt, {
      title: "Approved by admin",
      actor: (asset as AssetVersion).adminApprovedBy,
      type: "approved",
    })
  } else if ((asset as Asset).approvedAt) {
    pushIfDate(events, (asset as Asset).approvedAt, {
      title: "Approved",
      actor: (asset as Asset).approvedByName ?? (asset as Asset).approvedBy,
      description: (asset as Asset).approvalReason || undefined,
      type: "approved",
    })
  }

  // 6. Rejected
  if (isVersion && (asset as AssetVersion).rejectedAt) {
    pushIfDate(events, (asset as AssetVersion).rejectedAt, {
      title: "Rejected",
      actor: (asset as AssetVersion).rejectedBy,
      description: (asset as AssetVersion).rejectionReason || undefined,
      type: "rejected",
    })
  } else if ((asset as Asset).rejectionReason) {
    // standalone asset with rejection but no timestamp – use updatedAt
    pushIfDate(events, (asset as Asset).updatedAt, {
      title: "Rejected",
      description: (asset as Asset).rejectionReason || undefined,
      type: "rejected",
    })
  }

  // 7. Quality check completed
  const reviewData = asset.reviewData
  if (reviewData) {
    const checkDate =
      reviewData.lastReviewedAt ??
      (reviewData.copyright?.data as any)?.checkedAt ??
      null
    if (checkDate) {
      events.push({
        id: `quality-check-${asset.id}`,
        date: checkDate instanceof Date ? checkDate : new Date(checkDate),
        title: "Quality checks completed",
        description: `Overall score: ${reviewData.overallScore}/100 (${reviewData.checksCompleted}/${reviewData.totalChecks} checks)`,
        actor: reviewData.reviewedBy,
        type: "quality_check",
      })
    } else if (asset.copyrightCheckStatus === "completed") {
      // Fallback: no specific date, use updatedAt
      pushIfDate(events, (asset as any).updatedAt ?? uploadDate, {
        id: `quality-check-fallback-${asset.id}`,
        title: "Quality checks completed",
        description: `Overall score: ${reviewData.overallScore}/100`,
        type: "quality_check",
      })
    }
  }

  // 8. Comments
  const comments: VersionComment[] = (asset as any).comments ?? []
  comments.forEach((c) => {
    events.push({
      id: `comment-${c.id}`,
      date: c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt),
      title: `${c.authorName} commented`,
      description: c.content,
      actor: c.authorName,
      type: "comment",
    })
  })

  // 9. Brand set (synthesised – show once at creation)
  const brandName = (asset as any).brandName ?? versionGroup?.brandName
  if (brandName && uploadDate) {
    events.push({
      id: `brand-set-${asset.id}`,
      date: new Date(uploadDate.getTime() + 2), // after upload
      title: `Brand set to ${brandName}`,
      type: "brand_change",
    })
  }

  // 10. Design type assigned
  const designType = (asset as any).designType ?? versionGroup?.designType
  if (designType && uploadDate) {
    const label = designType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    events.push({
      id: `design-type-${asset.id}`,
      date: new Date(uploadDate.getTime() + 3),
      title: `Design type set to ${label}`,
      type: "design_type",
    })
  }

  // 11. Content type classification
  const contentType = (asset as any).contentType
  if (contentType && uploadDate) {
    events.push({
      id: `content-type-${asset.id}`,
      date: new Date(uploadDate.getTime() + 4),
      title: contentType === "ai_generated" ? "Classified as AI-generated content" : "Classified as original content",
      description: contentType === "ai_generated" ? "AI compliance workflow initiated" : undefined,
      type: "content_type",
    })
  }

  // 12. File metadata recorded
  const fileSize = (asset as any).fileSize
  const dimensions = (asset as any).dimensions
  const fileType = (asset as any).fileType
  if (uploadDate && (fileSize || dimensions)) {
    const parts: string[] = []
    if (fileType) parts.push(fileType.toUpperCase())
    if (fileSize) parts.push(`${(fileSize / 1024 / 1024).toFixed(1)} MB`)
    if (dimensions) parts.push(`${dimensions.width} x ${dimensions.height}`)
    events.push({
      id: `metadata-${asset.id}`,
      date: new Date(uploadDate.getTime() + 5),
      title: "File metadata recorded",
      description: parts.join(" · "),
      type: "metadata",
    })
  }

  // 13. Tags assigned
  const tags: string[] = (asset as any).tags ?? versionGroup?.tags ?? []
  if (tags.length > 0 && uploadDate) {
    events.push({
      id: `tags-${asset.id}`,
      date: new Date(uploadDate.getTime() + 6),
      title: `${tags.length} tag${tags.length !== 1 ? "s" : ""} assigned`,
      description: tags.join(", "),
      type: "tag",
    })
  }

  // 14. Linked to task
  const ticketId = (asset as any).ticketId ?? (asset as any).taskId ?? versionGroup?.taskId
  const ticketTitle = (asset as any).ticketTitle
  if (ticketId && uploadDate) {
    events.push({
      id: `task-link-${asset.id}`,
      date: new Date(uploadDate.getTime() + 7),
      title: `Linked to task ${ticketTitle ? `"${ticketTitle}"` : ticketId}`,
      type: "task_link",
    })
  }

  // 15. Copyright check initiated (if status exists but before completed)
  if (asset.copyrightCheckStatus && asset.copyrightCheckStatus !== "pending") {
    const reviewCheckDate = reviewData?.lastReviewedAt ?? (reviewData?.copyright?.data as any)?.checkedAt
    const initiatedDate = reviewCheckDate
      ? new Date(new Date(reviewCheckDate).getTime() - 90000) // ~1.5 min before completion
      : uploadDate
        ? new Date(uploadDate.getTime() + 60000 * 30) // 30 min after upload fallback
        : null
    if (initiatedDate) {
      events.push({
        id: `check-initiated-${asset.id}`,
        date: initiatedDate,
        title: "Quality checks initiated",
        description: "Copyright, accessibility, SEO, brand compliance, performance, and security checks queued",
        type: "check_initiated",
      })
    }
  }

  // 16. Individual quality check scores (if reviewData has per-check data)
  if (reviewData && uploadDate) {
    const baseTime = reviewData.lastReviewedAt ?? (reviewData.copyright?.data as any)?.checkedAt ?? uploadDate
    const base = baseTime instanceof Date ? baseTime : new Date(baseTime)
    const checks = [
      { key: "copyright", label: "Copyright check", data: reviewData.copyright?.data },
      { key: "accessibility", label: "Accessibility check", data: reviewData.accessibility?.data },
      { key: "seo", label: "SEO check", data: reviewData.seo?.data },
      { key: "brandCompliance", label: "Brand compliance check", data: reviewData.brandCompliance?.data },
      { key: "performance", label: "Performance check", data: reviewData.performance?.data },
      { key: "security", label: "Security check", data: reviewData.security?.data },
    ]
    checks.forEach((chk, i) => {
      if (chk.data && (chk.data as any).score != null) {
        events.push({
          id: `check-${chk.key}-${asset.id}`,
          date: new Date(base.getTime() - (checks.length - i) * 5000), // stagger before completion
          title: `${chk.label} completed`,
          description: `Score: ${(chk.data as any).score}/100`,
          type: "quality_check",
        })
      }
    })
  }

  // Sort newest-first
  events.sort((a, b) => b.date.getTime() - a.date.getTime())
  return events
}

// ---------------------------------------------------------------------------
// Group events by calendar day
// ---------------------------------------------------------------------------

function groupByDay(events: TimelineEvent[]): { label: string; date: Date; events: TimelineEvent[] }[] {
  const groups: { label: string; date: Date; events: TimelineEvent[] }[] = []
  for (const ev of events) {
    const last = groups[groups.length - 1]
    if (last && isSameDay(last.date, ev.date)) {
      last.events.push(ev)
    } else {
      groups.push({ label: format(ev.date, "MMMM d"), date: ev.date, events: [ev] })
    }
  }
  return groups
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AssetTimelineProps {
  asset: Asset | AssetVersion | (Asset & Partial<AssetVersion>)
  versionGroup?: AssetVersionGroup | null
  children?: React.ReactNode
}

export function AssetTimeline({ asset, versionGroup, children }: AssetTimelineProps) {
  const events = useMemo(() => buildTimelineEvents(asset, versionGroup), [asset, versionGroup])
  const groups = useMemo(() => groupByDay(events), [events])

  return (
    <div className="max-w-2xl space-y-0">
      {/* Comments section (passed from parent, reuses site-wide TaskComments) */}
      {children}

      {/* Timeline */}
      {groups.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          No timeline events yet.
        </div>
      ) : (
        <div className="space-y-0">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Day header */}
              <div className="text-xs font-medium text-muted-foreground pt-4 pb-2">{group.label}</div>

              {/* Events in this day */}
              <div className="relative">
                {group.events.map((ev, idx) => {
                  const Icon = EVENT_ICONS[ev.type]
                  const isLast = idx === group.events.length - 1

                  return (
                    <div key={ev.id} className="relative flex gap-3 pb-4">
                      {/* Vertical rail */}
                      {!isLast && (
                        <div className="absolute left-[9px] top-[22px] bottom-0 w-px bg-border" />
                      )}

                      {/* Dot */}
                      <div
                        className={cn(
                          "relative z-10 mt-0.5 h-[18px] w-[18px] rounded-full flex items-center justify-center shrink-0",
                          DOT_COLORS[ev.type],
                        )}
                      >
                        <Icon className="h-2.5 w-2.5 text-white" />
                      </div>

                      {/* Content + timestamp */}
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm leading-snug">
                            {ev.title}
                            {ev.actor && (
                              <span className="text-muted-foreground"> by {ev.actor}</span>
                            )}
                          </p>
                          {ev.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ev.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                          {format(ev.date, "h:mm a")}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
