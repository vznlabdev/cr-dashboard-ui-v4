"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"
import type { InboxActivity, ActivityType } from "@/types"

interface InboxContextType {
  activities: InboxActivity[]
  unreadCount: number
  
  // Filtering
  filterBy: ActivityType | 'all'
  setFilterBy: (filter: ActivityType | 'all') => void
  
  // Grouping
  groupBy: 'time' | 'project' | 'type'
  setGroupBy: (group: 'time' | 'project' | 'type') => void
  
  // Archive view
  showArchived: boolean
  toggleArchived: () => void
  
  // Actions
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  archiveActivity: (id: string) => void
  deleteActivity: (id: string) => void
  
  // Selection (for detail view)
  selectedActivity: InboxActivity | null
  selectActivity: (id: string) => void
  
  // Filtered and grouped activities
  filteredActivities: InboxActivity[]
}

const InboxContext = createContext<InboxContextType | undefined>(undefined)

// Fixed reference date to avoid hydration mismatches
const REFERENCE_DATE = new Date('2024-01-15T12:00:00Z')

// Mock initial activities with comprehensive coverage
const mockActivities: InboxActivity[] = [
  // Mention - Recent
  {
    id: '1',
    type: 'mention',
    title: '@You in "Design hero image"',
    description: 'Sarah mentioned you: "@john can you review the latest mockups?"',
    timestamp: new Date(REFERENCE_DATE.getTime() - 2 * 60 * 60 * 1000), // 2h ago
    read: false,
    archived: false,
    actor: {
      id: 'user-1',
      name: 'Sarah Chen',
      initials: 'SC',
    },
    project: {
      id: 'proj-1',
      name: 'Summer Campaign 2024',
    },
    task: {
      id: 'task-1',
      title: 'Design hero image',
      status: 'production',
    },
    metadata: {
      mentionContext: 'can you review the latest mockups?',
      commentId: 'comment-123',
    },
    primaryAction: {
      label: 'View Comment',
      href: '/projects/proj-1/tasks/task-1',
    },
  },
  
  // Task Assignment
  {
    id: '2',
    type: 'task_assigned',
    title: 'Assigned to "Create Instagram stories"',
    description: 'John Doe assigned you to this task for Summer Campaign 2024',
    timestamp: new Date(REFERENCE_DATE.getTime() - 3 * 60 * 60 * 1000), // 3h ago
    read: false,
    archived: false,
    actor: {
      id: 'user-2',
      name: 'John Doe',
      initials: 'JD',
    },
    project: {
      id: 'proj-1',
      name: 'Summer Campaign 2024',
    },
    task: {
      id: 'task-2',
      title: 'Create Instagram stories',
      status: 'assigned',
    },
    metadata: {},
    primaryAction: {
      label: 'View Task',
      href: '/projects/proj-1/tasks/task-2',
    },
  },
  
  // Status Change
  {
    id: '3',
    type: 'task_status',
    title: '"Twitter banner design" moved to QA Review',
    description: 'Emily updated the status from Production to QA Review',
    timestamp: new Date(REFERENCE_DATE.getTime() - 5 * 60 * 60 * 1000), // 5h ago
    read: false,
    archived: false,
    actor: {
      id: 'user-3',
      name: 'Emily Rodriguez',
      initials: 'ER',
    },
    project: {
      id: 'proj-1',
      name: 'Summer Campaign 2024',
    },
    task: {
      id: 'task-3',
      title: 'Twitter banner design',
      status: 'qa_review',
    },
    metadata: {
      oldStatus: 'production',
      newStatus: 'qa_review',
    },
    primaryAction: {
      label: 'Review Task',
      href: '/projects/proj-1/tasks/task-3',
    },
  },
  
  // Asset Approved
  {
    id: '4',
    type: 'asset_approved',
    title: 'Asset "hero_image_final.png" approved',
    description: 'Legal team approved this asset for production use',
    timestamp: new Date(REFERENCE_DATE.getTime() - 8 * 60 * 60 * 1000), // 8h ago
    read: true,
    archived: false,
    actor: {
      id: 'user-4',
      name: 'Legal Team',
      initials: 'LT',
    },
    project: {
      id: 'proj-1',
      name: 'Summer Campaign 2024',
    },
    asset: {
      id: 'asset-1',
      name: 'hero_image_final.png',
    },
    metadata: {
      reviewerName: 'Jennifer Liu',
      feedback: 'All clearances passed. Ready for production.',
    },
    primaryAction: {
      label: 'View Asset',
      href: '/creative/assets',
    },
  },
  
  // Comment
  {
    id: '5',
    type: 'comment',
    title: 'New comment on "Design icon set"',
    description: 'Mike Chen added a comment: "These look great! Can we add..."',
    timestamp: new Date(REFERENCE_DATE.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    archived: false,
    actor: {
      id: 'user-5',
      name: 'Mike Chen',
      initials: 'MC',
    },
    project: {
      id: 'proj-2',
      name: 'Brand Refresh Campaign',
    },
    task: {
      id: 'task-4',
      title: 'Design icon set',
      status: 'production',
    },
    metadata: {
      commentText: 'These look great! Can we add a version with rounded corners?',
      commentId: 'comment-456',
    },
    primaryAction: {
      label: 'Reply',
      href: '/projects/proj-2/tasks/task-4',
    },
  },
  
  // Project Update
  {
    id: '6',
    type: 'project_update',
    title: 'Summer Campaign 2024 reached milestone',
    description: 'Project completed 75% of deliverables',
    timestamp: new Date(REFERENCE_DATE.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    archived: false,
    actor: {
      id: 'system',
      name: 'System',
      initials: 'SY',
    },
    project: {
      id: 'proj-1',
      name: 'Summer Campaign 2024',
    },
    metadata: {},
    primaryAction: {
      label: 'View Project',
      href: '/projects/proj-1',
    },
  },
  
  // Clearance Needed
  {
    id: '7',
    type: 'clearance_needed',
    title: 'Action required: Asset needs legal review',
    description: 'Asset "campaign_video.mp4" flagged for potential copyright issues',
    timestamp: new Date(REFERENCE_DATE.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: false,
    archived: false,
    actor: {
      id: 'system',
      name: 'Compliance System',
      initials: 'CS',
    },
    project: {
      id: 'proj-1',
      name: 'Summer Campaign 2024',
    },
    asset: {
      id: 'asset-2',
      name: 'campaign_video.mp4',
    },
    metadata: {
      feedback: 'Similarity score 45% detected. Legal review required.',
    },
    primaryAction: {
      label: 'Review Asset',
      href: '/legal',
      variant: 'default',
    },
  },
  
  // Deadline Approaching
  {
    id: '8',
    type: 'deadline_approaching',
    title: 'Due tomorrow: "Create Facebook ads"',
    description: 'Task deadline is approaching in less than 24 hours',
    timestamp: new Date(REFERENCE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    archived: false,
    actor: {
      id: 'system',
      name: 'Deadline Reminder',
      initials: 'DR',
    },
    project: {
      id: 'proj-1',
      name: 'Summer Campaign 2024',
    },
    task: {
      id: 'task-5',
      title: 'Create Facebook ads',
      status: 'production',
    },
    metadata: {},
    primaryAction: {
      label: 'View Task',
      href: '/projects/proj-1/tasks/task-5',
    },
  },
  
  // Team Invite
  {
    id: '9',
    type: 'team_invite',
    title: 'Added to "Brand Refresh Campaign"',
    description: 'Sarah Chen added you as a team member',
    timestamp: new Date(REFERENCE_DATE.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    read: true,
    archived: false,
    actor: {
      id: 'user-1',
      name: 'Sarah Chen',
      initials: 'SC',
    },
    project: {
      id: 'proj-2',
      name: 'Brand Refresh Campaign',
    },
    metadata: {},
    primaryAction: {
      label: 'View Project',
      href: '/projects/proj-2',
    },
  },
  
  // Asset Rejected
  {
    id: '10',
    type: 'asset_rejected',
    title: 'Asset "logo_variant.svg" rejected',
    description: 'QA team rejected this asset due to compliance issues',
    timestamp: new Date(REFERENCE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    read: true,
    archived: false,
    actor: {
      id: 'user-6',
      name: 'QA Team',
      initials: 'QA',
    },
    project: {
      id: 'proj-2',
      name: 'Brand Refresh Campaign',
    },
    asset: {
      id: 'asset-3',
      name: 'logo_variant.svg',
    },
    metadata: {
      reviewerName: 'Alex Thompson',
      feedback: 'Asset uses unlicensed font. Please update and resubmit.',
    },
    primaryAction: {
      label: 'Fix Asset',
      href: '/creative/assets',
    },
    secondaryActions: [
      {
        label: 'View Feedback',
        href: '/creative/assets/asset-3',
        variant: 'ghost',
      },
    ],
  },
]

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<InboxActivity[]>(mockActivities)
  const [filterBy, setFilterBy] = useState<ActivityType | 'all'>('all')
  const [groupBy, setGroupBy] = useState<'time' | 'project' | 'type'>('time')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    mockActivities[0]?.id || null
  )

  // Calculate unread count
  const unreadCount = useMemo(
    () => activities.filter((a) => !a.read && !a.archived).length,
    [activities]
  )

  // Filter activities
  const filteredActivities = useMemo(() => {
    // Show only archived or only non-archived based on toggle
    let filtered = showArchived
      ? activities.filter((a) => a.archived)
      : activities.filter((a) => !a.archived)
    
    if (filterBy !== 'all') {
      filtered = filtered.filter((a) => a.type === filterBy)
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [activities, filterBy, showArchived])

  // Get selected activity
  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedActivityId) || null,
    [activities, selectedActivityId]
  )

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setActivities((prev) => prev.map((a) => ({ ...a, read: true })))
  }, [])

  // Archive activity
  const archiveActivity = useCallback((id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, archived: true } : a))
    )
  }, [])

  // Delete activity
  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // Toggle archived view
  const toggleArchived = useCallback(() => {
    setShowArchived((prev) => !prev)
  }, [])

  // Select activity
  const selectActivity = useCallback((id: string) => {
    setSelectedActivityId(id)
    // Auto-mark as read when selected
    markAsRead(id)
  }, [markAsRead])

  return (
    <InboxContext.Provider
      value={{
        activities,
        unreadCount,
        filterBy,
        setFilterBy,
        groupBy,
        setGroupBy,
        showArchived,
        toggleArchived,
        markAsRead,
        markAllAsRead,
        archiveActivity,
        deleteActivity,
        selectedActivity,
        selectActivity,
        filteredActivities,
      }}
    >
      {children}
    </InboxContext.Provider>
  )
}

export function useInbox() {
  const context = useContext(InboxContext)
  if (!context) {
    throw new Error("useInbox must be used within InboxProvider")
  }
  return context
}
