"use client"

import { cn } from "@/lib/utils"
import { useWorkspace, workspaces, WorkspaceType } from "@/contexts/workspace-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BarChart3, Palette, Check, ChevronsUpDown } from "lucide-react"
import { useSidebar } from "./sidebar-context"
import { useRouter } from "next/navigation"

const workspaceIcons: Record<WorkspaceType, React.ComponentType<{ className?: string }>> = {
  stats: BarChart3,
  creative: Palette,
}

// Default home routes for each workspace
const workspaceHomeRoutes: Record<WorkspaceType, string> = {
  stats: "/",
  creative: "/creative",
}

interface WorkspaceSwitcherProps {
  variant?: "sidebar" | "mobile"
}

export function WorkspaceSwitcher({ variant = "sidebar" }: WorkspaceSwitcherProps) {
  const { currentWorkspace, setWorkspace, getWorkspace } = useWorkspace()
  const { collapsed } = useSidebar()
  const router = useRouter()
  const activeWorkspace = getWorkspace()
  const ActiveIcon = workspaceIcons[currentWorkspace]

  const isMobile = variant === "mobile"
  const isCollapsed = !isMobile && collapsed

  const handleWorkspaceChange = (workspaceId: WorkspaceType) => {
    if (workspaceId !== currentWorkspace) {
      setWorkspace(workspaceId)
      router.push(workspaceHomeRoutes[workspaceId])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm font-medium transition-all",
          "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isCollapsed ? "w-10 justify-center px-0" : "w-full justify-between",
          isMobile && "w-full justify-between"
        )}
      >
        <div className="flex items-center gap-2">
          <ActiveIcon className="h-4 w-4 shrink-0 text-primary" />
          {!isCollapsed && (
            <span className="truncate">{activeWorkspace.name}</span>
          )}
        </div>
        {!isCollapsed && (
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isCollapsed ? "start" : "start"}
        side={isMobile ? "bottom" : "right"}
        sideOffset={8}
        className="w-64"
      >
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Switch Workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => {
          const Icon = workspaceIcons[workspace.id]
          const isActive = workspace.id === currentWorkspace

          return (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceChange(workspace.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 py-2.5",
                isActive && "bg-accent"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">
                  {workspace.description}
                </span>
              </div>
              {isActive && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

