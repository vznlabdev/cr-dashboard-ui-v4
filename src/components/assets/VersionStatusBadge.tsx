import { Badge } from "@/components/ui/badge"
import { VersionStatus } from "@/types/creative"
import { cn } from "@/lib/utils"

interface VersionStatusBadgeProps {
  status: VersionStatus
  className?: string
}

const STATUS_CONFIG: Record<VersionStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  client_review: {
    label: "Client Review",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  client_approved: {
    label: "Client Approved",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  admin_review: {
    label: "Admin Review",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
}

export function VersionStatusBadge({ status, className }: VersionStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge
      variant="secondary"
      className={cn(config.className, "text-xs font-medium", className)}
    >
      {config.label}
    </Badge>
  )
}
