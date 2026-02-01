"use client"

import { Button } from "@/components/ui/button"
import { ActivityListItem } from "@/components/inbox/ActivityListItem"
import { ActivityDetailView } from "@/components/inbox/ActivityDetailView"
import { InboxFilters } from "@/components/inbox/InboxFilters"
import { useInbox } from "@/lib/contexts/inbox-context"
import { groupByTime } from "@/utils/time"
import { Archive, CheckCheck } from "lucide-react"
import { useMemo } from "react"

export default function InboxPage() {
  const {
    filteredActivities,
    unreadCount,
    filterBy,
    setFilterBy,
    showArchived,
    toggleArchived,
    markAllAsRead,
    selectedActivity,
    selectActivity,
    markAsRead,
    archiveActivity,
  } = useInbox()

  // Group activities by time
  const groupedActivities = useMemo(
    () => groupByTime(filteredActivities),
    [filteredActivities]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Compact Main Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">
          {showArchived ? 'Archived' : 'Inbox'}
        </h1>

        <Button
          variant={showArchived ? 'default' : 'outline'}
          size="sm"
          onClick={toggleArchived}
          className="gap-2"
        >
          <Archive className="h-4 w-4" />
          {showArchived ? 'Back to Inbox' : 'Archive'}
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Activity List */}
        <div className="w-80 border-r border-border bg-muted/30 overflow-y-auto">
          {/* Left Panel Header */}
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {showArchived ? 'Archived' : 'Inbox'}
                </span>
                {!showArchived && unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-blue-600 text-white text-xs font-medium">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <InboxFilters currentFilter={filterBy} onFilterChange={setFilterBy} />
                {!showArchived && unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8 px-2 gap-1.5"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="text-xs">Mark read</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* Today section */}
          {groupedActivities.today.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today
              </div>
              <div className="space-y-px">
                {groupedActivities.today.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    isSelected={selectedActivity?.id === activity.id}
                    onClick={() => selectActivity(activity.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday section */}
          {groupedActivities.yesterday.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Yesterday
              </div>
              <div className="space-y-px">
                {groupedActivities.yesterday.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    isSelected={selectedActivity?.id === activity.id}
                    onClick={() => selectActivity(activity.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Week section */}
          {groupedActivities.thisWeek.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                This Week
              </div>
              <div className="space-y-px">
                {groupedActivities.thisWeek.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    isSelected={selectedActivity?.id === activity.id}
                    onClick={() => selectActivity(activity.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Older section */}
          {groupedActivities.older.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Older
              </div>
              <div className="space-y-px">
                {groupedActivities.older.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    isSelected={selectedActivity?.id === activity.id}
                    onClick={() => selectActivity(activity.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Archive className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {showArchived ? 'No archived activities' : 'No activities'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {showArchived
                  ? 'Archived activities will appear here'
                  : filterBy === 'all'
                  ? "You're all caught up!"
                  : 'No activities match this filter'}
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 bg-background">
          {selectedActivity ? (
            <ActivityDetailView
              activity={selectedActivity}
              onMarkAsRead={markAsRead}
              onArchive={archiveActivity}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-8 text-center">
              <div>
                <h3 className="font-semibold mb-2">Select an activity</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an activity from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
