import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, ShieldCheck, ShieldAlert, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { isApprovalApproved, isApprovalRejected, isApprovalPending } from "@/lib/approval-utils"
import type { Asset } from "@/types/creative"

// Enhanced ApprovalStatusIcon with 3 states
interface ApprovalStatusIconProps {
  asset: Asset
  className?: string
  showLabel?: boolean
}

export function ApprovalStatusIcon({ asset, className, showLabel = false }: ApprovalStatusIconProps) {
  // Rejected first - takes precedence over review data
  if (isApprovalRejected(asset.approvalStatus)) {
    return (
      <div className="flex items-center gap-1.5" title="Rejected">
        <XCircle className={cn("h-3.5 w-3.5 text-red-600 dark:text-red-400", className)} />
        {showLabel && <span className="text-xs text-muted-foreground">Rejected</span>}
      </div>
    )
  }

  // State 1: Checked (has reviewData)
  if (asset.reviewData) {
    const Icon = ShieldCheck
    return (
      <div className="flex items-center gap-1.5" title="Quality checked">
        <Icon className={cn("h-3.5 w-3.5 text-blue-600 dark:text-blue-400", className)} />
        {showLabel && <span className="text-xs text-muted-foreground">Checked</span>}
      </div>
    )
  }
  
  // State 3: Manually Approved (approved or client_approved, without checks)
  if (isApprovalApproved(asset.approvalStatus)) {
    const approverName = asset.approvedByName || "Admin"
    return (
      <div className="flex items-center gap-1.5" title={`Manually approved by ${approverName}`}>
        <User className={cn("h-3.5 w-3.5 text-green-600 dark:text-green-400", className)} />
        {showLabel && (
          <span className="text-xs text-muted-foreground">
            Approved by {approverName}
          </span>
        )}
      </div>
    )
  }
  
  // State 2: Needs Check (pending / in-progress: draft, submitted, client_review, admin_review)
  if (isApprovalPending(asset.approvalStatus)) {
    return (
      <div className="flex items-center gap-1.5" title="Needs quality check">
        <ShieldAlert className={cn("h-3.5 w-3.5 text-amber-600 dark:text-amber-400", className)} />
        {showLabel && <span className="text-xs text-muted-foreground">Needs Check</span>}
      </div>
    )
  }
  
  return null
}

// QualityScoreBadge - only shown for checked assets
interface QualityScoreBadgeProps {
  asset?: Asset
  score?: number
  className?: string
}

export function QualityScoreBadge({ asset, score, className }: QualityScoreBadgeProps) {
  // Support both asset object and direct score prop for backwards compatibility
  let displayScore: number | undefined
  
  if (asset) {
    // Only show for checked assets
    if (!asset.reviewData) {
      return (
        <span className={cn("text-xs text-muted-foreground", className)}>
          —
        </span>
      )
    }
    displayScore = asset.reviewData.overallScore
  } else if (score !== undefined) {
    // Direct score prop (for task averages, etc.)
    displayScore = score
  }
  
  if (displayScore === undefined) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        —
      </span>
    )
  }
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 90) return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
    if (scoreValue >= 75) return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
    if (scoreValue >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
    return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "h-5 px-1.5 py-0 text-[10px] font-medium border-0",
        getScoreColor(displayScore),
        className
      )}
      title={`Quality Score: ${displayScore}/100`}
    >
      {displayScore}
    </Badge>
  )
}
