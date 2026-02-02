"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ActivityListItem } from "@/components/inbox/ActivityListItem"
import { ActivityDetailView } from "@/components/inbox/ActivityDetailView"
import { InboxFilters } from "@/components/inbox/InboxFilters"
import { useInbox } from "@/lib/contexts/inbox-context"
import { groupByTime } from "@/utils/time"
import { Archive, CheckCheck, Trash2, X } from "lucide-react"
import { useMemo, useState } from "react"

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
    deleteActivity,
    bulkMarkAsRead,
    bulkArchive,
    bulkDelete,
  } = useInbox()

  // Selection state for bulk actions
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set())

  // Group activities by time
  const groupedActivities = useMemo(
    () => groupByTime(filteredActivities),
    [filteredActivities]
  )

  // Bulk action handlers
  const handleBulkMarkRead = () => {
    bulkMarkAsRead(Array.from(selectedActivities))
    setSelectedActivities(new Set())
  }

  const handleBulkArchive = () => {
    bulkArchive(Array.from(selectedActivities))
    setSelectedActivities(new Set())
  }

  const handleBulkDelete = () => {
    bulkDelete(Array.from(selectedActivities))
    setSelectedActivities(new Set())
  }

  const handleCheckboxChange = (activityId: string, checked: boolean) => {
    const newSelected = new Set(selectedActivities)
    if (checked) {
      newSelected.add(activityId)
    } else {
      newSelected.delete(activityId)
    }
    setSelectedActivities(newSelected)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Activity List */}
        <div className="w-80 border-r border-border bg-muted/30 overflow-y-auto">
          {/* Left Panel Header */}
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="flex items-center justify-between px-3 py-2">
              {selectedActivities.size > 0 ? (
                // Selection State
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedActivities.size === filteredActivities.length && filteredActivities.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedActivities(new Set(filteredActivities.map(a => a.id)))
                        } else {
                          setSelectedActivities(new Set())
                        }
                      }}
                    />
                    <span className="text-sm font-medium">
                      {selectedActivities.size} selected
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkMarkRead}
                      className="h-8 w-8 p-0"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkArchive}
                      className="h-8 w-8 p-0"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="h-8 w-8 p-0"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedActivities(new Set())}
                      className="h-8 w-8 p-0"
                      title="Clear selection"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                // Default State
                <>
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
                    <Button
                      variant={showArchived ? 'default' : 'ghost'}
                      size="sm"
                      onClick={toggleArchived}
                      className="h-8 w-8 p-0"
                      title={showArchived ? 'Back to Inbox' : 'View Archive'}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <InboxFilters currentFilter={filterBy} onFilterChange={setFilterBy} />
                  </div>
                </>
              )}
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
                    isCheckboxSelected={selectedActivities.has(activity.id)}
                    onCheckboxChange={(checked) => handleCheckboxChange(activity.id, checked)}
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
                    isCheckboxSelected={selectedActivities.has(activity.id)}
                    onCheckboxChange={(checked) => handleCheckboxChange(activity.id, checked)}
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
                    isCheckboxSelected={selectedActivities.has(activity.id)}
                    onCheckboxChange={(checked) => handleCheckboxChange(activity.id, checked)}
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
                    isCheckboxSelected={selectedActivities.has(activity.id)}
                    onCheckboxChange={(checked) => handleCheckboxChange(activity.id, checked)}
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
