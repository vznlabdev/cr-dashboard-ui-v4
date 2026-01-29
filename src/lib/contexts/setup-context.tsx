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
  progress: string
  totalTasks: number
  completedTasks: number
  completeTask: (categoryId: string, taskId: string) => void
  dismissSetup: () => void
  resetSetup: () => void
}

// Initial setup state with mock data
const initialSetupState: SetupState = {
  isComplete: false,
  isDismissed: false,
  categories: [
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add your personal information and preferences",
      locked: false,
      tasks: [
        {
          id: "photo",
          title: "Add profile photo",
          completed: false,
          required: true,
        },
        {
          id: "notifications",
          title: "Set notification preferences",
          completed: false,
          required: false,
        },
      ],
    },
    {
      id: "team",
      title: "Add team members",
      description: "Invite your team to collaborate",
      locked: false,
      tasks: [
        {
          id: "invite",
          title: "Invite your first team member",
          completed: false,
          required: true,
        },
      ],
    },
    {
      id: "project",
      title: "Create first project",
      description: "Start organizing your work",
      locked: false,
      tasks: [
        {
          id: "create",
          title: "Start your first project",
          completed: false,
          required: true,
        },
      ],
    },
    {
      id: "integrations",
      title: "Set up integrations",
      description: "Connect your favorite tools",
      locked: false,
      tasks: [
        {
          id: "calendar",
          title: "Connect calendar",
          completed: false,
          required: false,
        },
        {
          id: "storage",
          title: "Link storage provider",
          completed: false,
          required: false,
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

  // Progress string for badge
  const progress = `${completedTasks}/${totalTasks}`

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

      // Check if all required tasks are now complete
      const allRequiredComplete = newCategories.every((category) =>
        category.tasks
          .filter((task) => task.required)
          .every((task) => task.completed)
      )

      return {
        ...prev,
        categories: newCategories,
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
