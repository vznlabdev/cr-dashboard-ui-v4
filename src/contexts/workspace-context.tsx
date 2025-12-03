"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type WorkspaceType = "stats" | "creative"

export interface Workspace {
  id: WorkspaceType
  name: string
  description: string
}

export const workspaces: Workspace[] = [
  {
    id: "stats",
    name: "Stats Workspace",
    description: "Analytics, projects, and compliance tracking",
  },
  {
    id: "creative",
    name: "Creative Workspace",
    description: "Creative requests and ticket management",
  },
]

interface WorkspaceContextType {
  currentWorkspace: WorkspaceType
  setWorkspace: (workspace: WorkspaceType) => void
  getWorkspace: () => Workspace
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>("stats")

  // Persist workspace selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cr-workspace")
      if (stored === "stats" || stored === "creative") {
        setCurrentWorkspace(stored)
      }
    }
  }, [])

  const handleSetWorkspace = (workspace: WorkspaceType) => {
    setCurrentWorkspace(workspace)
    if (typeof window !== "undefined") {
      localStorage.setItem("cr-workspace", workspace)
    }
  }

  const getWorkspace = (): Workspace => {
    return workspaces.find((w) => w.id === currentWorkspace) || workspaces[0]
  }

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        setWorkspace: handleSetWorkspace,
        getWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}

