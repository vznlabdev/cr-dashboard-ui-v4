"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"
import { ActivityIcon } from "./ActivityIcon"
import type { ActivityType } from "@/types"

interface InboxFiltersProps {
  currentFilter: ActivityType | 'all'
  onFilterChange: (filter: ActivityType | 'all') => void
}

const filterOptions: { value: ActivityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All activities' },
  { value: 'mention', label: 'Mentions' },
  { value: 'task_assigned', label: 'Assignments' },
  { value: 'task_status', label: 'Status changes' },
  { value: 'project_update', label: 'Project updates' },
  { value: 'comment', label: 'Comments' },
  { value: 'asset_approved', label: 'Approvals' },
  { value: 'asset_rejected', label: 'Rejections' },
  { value: 'clearance_needed', label: 'Action required' },
  { value: 'team_invite', label: 'Team invites' },
  { value: 'deadline_approaching', label: 'Deadlines' },
]

export function InboxFilters({ currentFilter, onFilterChange }: InboxFiltersProps) {
  const activeCount = currentFilter === 'all' ? 0 : 1

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-medium">
              {activeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filterOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={currentFilter === option.value}
            onCheckedChange={() => onFilterChange(option.value)}
          >
            <div className="flex items-center gap-2">
              {option.value !== 'all' && (
                <ActivityIcon type={option.value as ActivityType} size="sm" />
              )}
              <span>{option.label}</span>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
