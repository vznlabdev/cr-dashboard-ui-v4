import { 
  AtSign, 
  UserPlus, 
  ArrowRight, 
  FolderKanban, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Clock,
  type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActivityType } from "@/types"

interface ActivityIconProps {
  type: ActivityType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Icon mapping for each activity type
const iconMap: Record<ActivityType, LucideIcon> = {
  mention: AtSign,
  task_assigned: UserPlus,
  task_status: ArrowRight,
  project_update: FolderKanban,
  comment: MessageSquare,
  asset_approved: CheckCircle2,
  asset_rejected: XCircle,
  clearance_needed: AlertTriangle,
  team_invite: Users,
  deadline_approaching: Clock,
}

// Color mapping for each activity type
const colorMap: Record<ActivityType, string> = {
  mention: 'text-blue-600 dark:text-blue-400',
  task_assigned: 'text-purple-600 dark:text-purple-400',
  task_status: 'text-gray-600 dark:text-gray-400',
  project_update: 'text-orange-600 dark:text-orange-400',
  comment: 'text-gray-600 dark:text-gray-400',
  asset_approved: 'text-green-600 dark:text-green-400',
  asset_rejected: 'text-red-600 dark:text-red-400',
  clearance_needed: 'text-amber-600 dark:text-amber-400',
  team_invite: 'text-indigo-600 dark:text-indigo-400',
  deadline_approaching: 'text-orange-600 dark:text-orange-400',
}

// Size mapping
const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function ActivityIcon({ type, size = 'md', className }: ActivityIconProps) {
  const Icon = iconMap[type]
  const colorClass = colorMap[type]
  const sizeClass = sizeMap[size]

  return (
    <Icon 
      className={cn(sizeClass, colorClass, className)} 
      strokeWidth={2}
    />
  )
}
