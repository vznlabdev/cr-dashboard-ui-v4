"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

// Setup task interface
export interface SetupTask {
  id: string
  title: string
  completed: boolean
  required: boolean
}

// Setup category interface
export interface SetupCategory {
  id: string
  title: string
  description: string
  tasks: SetupTask[]
  locked: boolean
}

// Setup state interface
interface SetupState {
  isComplete: boolean
  isDismissed: boolean
  categories: SetupCategory[]
}

// Context interface
interface SetupContextType {
  setupState: SetupState
  isSetupComplete: boolean
  isDismissed: boolean
  progress: string // Now shows "5%" instead of "1/21"
  progressPercentage: number // Raw percentage number (5)
  detailedProgress: string // "1/21" for places that need it
  totalTasks: number
  completedTasks: number
  completeTask: (categoryId: string, taskId: string) => void
  dismissSetup: () => void
  resetSetup: () => void
}

// Initial setup state with admin-focused categories
const initialSetupState: SetupState = {
  isComplete: false,
  isDismissed: false,
  categories: [
    {
      id: "company-settings",
      title: "Setup Company Settings",
      description: "Configure your primary company profile, sub-accounts, approvals, and AI tools",
      locked: false,
      tasks: [
        {
          id: "company-profile",
          title: "Complete primary company profile",
          completed: false,
          required: true,
        },
        {
          id: "sub-accounts",
          title: "Add sub-company accounts (if applicable)",
          completed: false,
          required: false,
        },
        {
          id: "approval-workflows",
          title: "Configure approval workflows",
          completed: false,
          required: true,
        },
        {
          id: "ai-tools",
          title: "Set up AI tools and integrations",
          completed: false,
          required: false,
        },
        {
          id: "personal-profile",
          title: "Complete your personal admin profile",
          completed: false,
          required: true,
        },
      ],
    },
    {
      id: "team-members",
      title: "Add Team Members",
      description: "Invite company admins, creative team, talent, and clients",
      locked: true,
      tasks: [
        {
          id: "company-admins",
          title: "Add company administrators",
          completed: false,
          required: true,
        },
        {
          id: "creative-team",
          title: "Invite creative team members",
          completed: false,
          required: false,
        },
        {
          id: "talent",
          title: "Add talent and contractors",
          completed: false,
          required: false,
        },
        {
          id: "clients",
          title: "Invite client stakeholders",
          completed: false,
          required: false,
        },
      ],
    },
    {
      id: "brands",
      title: "Create Brand Profiles",
      description: "Set up brand profiles for your organization",
      locked: true,
      tasks: [
        {
          id: "first-brand",
          title: "Create your first brand profile",
          completed: false,
          required: true,
        },
        {
          id: "brand-assets",
          title: "Upload brand assets and guidelines",
          completed: false,
          required: false,
        },
        {
          id: "additional-brands",
          title: "Add additional brands (if applicable)",
          completed: false,
          required: false,
        },
      ],
    },
    {
      id: "projects",
      title: "Setup Projects",
      description: "Create your first project and configure project settings",
      locked: true,
      tasks: [
        {
          id: "first-project",
          title: "Create your first project",
          completed: false,
          required: true,
        },
        {
          id: "project-templates",
          title: "Set up project templates",
          completed: false,
          required: false,
        },
        {
          id: "project-permissions",
          title: "Configure project permissions",
          completed: false,
          required: false,
        },
      ],
    },
    {
      id: "tasks",
      title: "Create Tasks",
      description: "Add tasks to your project and assign team members",
      locked: true,
      tasks: [
        {
          id: "first-task",
          title: "Create your first task",
          completed: false,
          required: true,
        },
        {
          id: "task-workflow",
          title: "Configure task workflow stages",
          completed: false,
          required: false,
        },
        {
          id: "task-assignments",
          title: "Assign tasks to team members",
          completed: false,
          required: false,
        },
      ],
    },
    {
      id: "reporting",
      title: "Configure Reporting and Dashboards",
      description: "Set up analytics, reports, and dashboard preferences",
      locked: true,
      tasks: [
        {
          id: "dashboard-layout",
          title: "Customize your dashboard layout",
          completed: false,
          required: false,
        },
        {
          id: "report-preferences",
          title: "Configure report preferences",
          completed: false,
          required: false,
        },
        {
          id: "notifications",
          title: "Set up notification preferences",
          completed: false,
          required: true,
        },
      ],
    },
  ],
}

// Create context
const SetupContext = createContext<SetupContextType | undefined>(undefined)

// Provider component
export function SetupProvider({ children }: { children: ReactNode }) {
  const [setupState, setSetupState] = useState<SetupState>(initialSetupState)

  // Calculate total and completed tasks
  const totalTasks = setupState.categories.reduce(
    (acc, category) => acc + category.tasks.length,
    0
  )
  const completedTasks = setupState.categories.reduce(
    (acc, category) =>
      acc + category.tasks.filter((task) => task.completed).length,
    0
  )

  // Calculate if setup is complete (all required tasks done)
  const isSetupComplete =
    setupState.categories.every((category) =>
      category.tasks
        .filter((task) => task.required)
        .every((task) => task.completed)
    ) || setupState.isComplete

  // Progress calculations
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0
  const progress = `${progressPercentage}%`
  const detailedProgress = `${completedTasks}/${totalTasks}`

  // Complete a specific task
  const completeTask = (categoryId: string, taskId: string) => {
    setSetupState((prev) => {
      const newCategories = prev.categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            tasks: category.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            ),
          }
        }
        return category
      })

      // Sequential unlocking: unlock next category when all required tasks in previous are complete
      const categoryOrder = ["company-settings", "team-members", "brands", "projects", "tasks", "reporting"]
      const updatedCategories = newCategories.map((category, index) => {
        if (index === 0) {
          // First category is always unlocked
          return { ...category, locked: false }
        }
        
        // Check if previous category has all required tasks complete
        const prevCategoryId = categoryOrder[index - 1]
        const prevCategory = newCategories.find((cat) => cat.id === prevCategoryId)
        const prevRequiredComplete = prevCategory
          ? prevCategory.tasks.filter((task) => task.required).every((task) => task.completed)
          : false
        
        return { ...category, locked: !prevRequiredComplete }
      })

      // Check if all required tasks are now complete
      const allRequiredComplete = updatedCategories.every((category) =>
        category.tasks
          .filter((task) => task.required)
          .every((task) => task.completed)
      )

      return {
        ...prev,
        categories: updatedCategories,
        isComplete: allRequiredComplete,
      }
    })
  }

  // Dismiss setup (skip)
  const dismissSetup = () => {
    setSetupState((prev) => ({
      ...prev,
      isDismissed: true,
    }))
  }

  // Reset setup (for testing or re-enabling)
  const resetSetup = () => {
    setSetupState(initialSetupState)
  }

  const value: SetupContextType = {
    setupState,
    isSetupComplete,
    isDismissed: setupState.isDismissed,
    progress,
    progressPercentage,
    detailedProgress,
    totalTasks,
    completedTasks,
    completeTask,
    dismissSetup,
    resetSetup,
  }

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>
}

// Custom hook to use setup context
export function useSetup() {
  const context = useContext(SetupContext)
  if (context === undefined) {
    throw new Error("useSetup must be used within a SetupProvider")
  }
  return context
}
