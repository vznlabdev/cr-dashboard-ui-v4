"use client"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState, ReactNode } from "react"
import type { SetupTask } from "@/lib/contexts/setup-context"
import { Button } from "@/components/ui/button"

interface SetupTaskDetailProps {
  task: SetupTask
  categoryId: string
  onToggle: (categoryId: string, taskId: string) => void
  actionButton?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  children?: ReactNode
}

export function SetupTaskDetail({
  task,
  categoryId,
  onToggle,
  actionButton,
  children,
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

          {/* Action button */}
          {actionButton && !task.completed && (
            <div className="mb-3">
              <Button
                onClick={actionButton.onClick}
                variant={actionButton.variant || "default"}
                size="sm"
              >
                {actionButton.label}
              </Button>
            </div>
          )}

          {/* Custom children content */}
          {children && <div className="mb-3">{children}</div>}

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
    // Company Settings
    "company-profile":
      "Set up your primary company details including name, industry, size, and contact information.",
    "sub-accounts":
      "Create sub-accounts for departments, divisions, or subsidiaries to manage permissions hierarchically.",
    "approval-workflows":
      "Define the approval stages and approvers for your content review process.",
    "ai-tools":
      "Enable AI-powered tools like GPT-4, DALL-E, and content analyzers to enhance your workflow.",
    "personal-profile":
      "Complete your admin profile with photo, bio, and notification preferences.",
    
    // Team Members
    "company-admins":
      "Invite administrators who will have full access to settings, projects, and team management.",
    "creative-team":
      "Invite creative team members who will create and manage content and assets.",
    "talent":
      "Add talent, contractors, and freelancers who will contribute to your projects.",
    "clients":
      "Invite client stakeholders who need visibility into project progress and approvals.",
    
    // Brands
    "first-brand":
      "Create your first brand profile with logo, colors, and brand guidelines.",
    "brand-assets":
      "Upload brand assets like logos, fonts, and style guides for team reference.",
    "additional-brands":
      "Add more brand profiles if you manage multiple brands or sub-brands.",
    
    // Projects
    "first-project":
      "Create your first project to start organizing tasks, assets, and team collaboration.",
    "project-templates":
      "Set up reusable project templates for common workflows and project types.",
    "project-permissions":
      "Configure who can view, edit, and manage projects across your organization.",
    
    // Tasks
    "first-task":
      "Add your first task to the project with assignees, due dates, and deliverables.",
    "task-workflow":
      "Customize task stages like To Do, In Progress, Review, and Complete.",
    "task-assignments":
      "Assign tasks to team members and set up notifications for updates.",
    
    // Reporting
    "dashboard-layout":
      "Customize your dashboard with widgets for projects, tasks, analytics, and KPIs.",
    "report-preferences":
      "Configure automated reports and choose which metrics to track.",
    "notifications":
      "Set up how and when you receive notifications about tasks, approvals, and updates.",
    
    // Legacy tasks (keeping for backwards compatibility)
    photo:
      "Add a profile picture to personalize your account and help your team recognize you.",
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
  return [
    "company-admins",
    "ai-tools",
    "first-brand",
    "project-templates",
    "task-workflow",
    "invite",
    "calendar",
    "storage",
  ].includes(taskId)
}

function getTaskDetails(taskId: string): string {
  const details: Record<string, string> = {
    "company-admins":
      "Admin team members will receive an email invitation with setup instructions. They'll have access to all company settings and can manage other users.",
    "ai-tools":
      "AI tools require API keys from providers like OpenAI. You can set usage limits to control costs. Tools can be enabled or disabled at any time.",
    "first-brand":
      "You'll need your brand logo, primary colors, and any existing brand guidelines. This helps maintain consistency across all creative assets.",
    "project-templates":
      "Templates save time by pre-configuring tasks, workflows, and team assignments for recurring project types like campaigns or product launches.",
    "task-workflow":
      "Custom workflows help match your team's process. You can add stages, set approval requirements, and configure automatic transitions.",
    invite:
      "You'll need team member email addresses. They'll receive an invitation to join your workspace.",
    calendar:
      "Supports Google Calendar, Outlook, and Apple Calendar. You'll need to authorize access to your calendar.",
    storage:
      "Compatible with Google Drive, Dropbox, and OneDrive. Authentication required.",
  }
  return details[taskId] || ""
}
