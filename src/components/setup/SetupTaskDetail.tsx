"use client"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import type { SetupTask } from "@/lib/contexts/setup-context"

interface SetupTaskDetailProps {
  task: SetupTask
  categoryId: string
  onToggle: (categoryId: string, taskId: string) => void
}

export function SetupTaskDetail({
  task,
  categoryId,
  onToggle,
}: SetupTaskDetailProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="flex items-start gap-4">
        {/* Circular icon indicator */}
        <button
          onClick={() => onToggle(categoryId, task.id)}
          className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5",
            task.completed
              ? "bg-primary border-primary"
              : "border-muted-foreground hover:border-primary"
          )}
        >
          {task.completed && (
            <svg
              className="h-3.5 w-3.5 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1">
            {task.title}
            {task.required && (
              <span className="text-sm text-red-500 ml-1">*</span>
            )}
          </h3>
          
          {/* Task description - can be customized per task */}
          <p className="text-sm text-muted-foreground mb-3">
            {getTaskDescription(task.id)}
          </p>

          {/* Optional "What you'll need" section */}
          {hasTaskDetails(task.id) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>What you'll need</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showDetails && "rotate-180"
                )}
              />
            </button>
          )}

          {showDetails && (
            <div className="mt-3 text-sm text-muted-foreground">
              {getTaskDetails(task.id)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions to provide task-specific content
function getTaskDescription(taskId: string): string {
  const descriptions: Record<string, string> = {
    photo:
      "Add a profile picture to personalize your account and help your team recognize you.",
    notifications:
      "Configure how and when you want to receive notifications about tasks, mentions, and updates.",
    invite:
      "Invite team members to collaborate on projects and manage creative assets together.",
    create:
      "Start your first project to organize tasks, assets, and team collaboration in one place.",
    calendar:
      "Sync your calendar to see deadlines and schedule tasks alongside your other commitments.",
    storage:
      "Connect your cloud storage provider to easily import and manage creative assets.",
  }
  return descriptions[taskId] || "Complete this step to continue setup."
}

function hasTaskDetails(taskId: string): boolean {
  return ["invite", "calendar", "storage"].includes(taskId)
}

function getTaskDetails(taskId: string): string {
  const details: Record<string, string> = {
    invite:
      "You'll need team member email addresses. They'll receive an invitation to join your workspace.",
    calendar:
      "Supports Google Calendar, Outlook, and Apple Calendar. You'll need to authorize access to your calendar.",
    storage:
      "Compatible with Google Drive, Dropbox, and OneDrive. Authentication required.",
  }
  return details[taskId] || ""
}
