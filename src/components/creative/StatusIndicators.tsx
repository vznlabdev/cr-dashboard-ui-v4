import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, FileEdit } from "lucide-react"
import { cn } from "@/lib/utils"

// ApprovalStatusIcon component
interface ApprovalStatusIconProps {
  status?: "draft" | "pending" | "approved" | "rejected"
  className?: string
}

export function ApprovalStatusIcon({ status, className }: ApprovalStatusIconProps) {
  if (!status || status === "draft") return null
  
  const icons = {
    approved: <CheckCircle className={cn("h-3.5 w-3.5 text-green-600 dark:text-green-400", className)} />,
    pending: <Clock className={cn("h-3.5 w-3.5 text-amber-600 dark:text-amber-400", className)} />,
    rejected: <XCircle className={cn("h-3.5 w-3.5 text-red-600 dark:text-red-400", className)} />
  }
  
  return (
    <div title={`${status.charAt(0).toUpperCase() + status.slice(1)}`}>
      {icons[status]}
    </div>
  )
}

// QualityScoreBadge component
interface QualityScoreBadgeProps {
  score: number
  className?: string
}

export function QualityScoreBadge({ score, className }: QualityScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
    if (score >= 75) return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
    if (score >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
    return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "h-5 px-1.5 py-0 text-[10px] font-medium border-0",
        getScoreColor(score),
        className
      )}
      title={`Quality Score: ${score}/100`}
    >
      {score}
    </Badge>
  )
}
