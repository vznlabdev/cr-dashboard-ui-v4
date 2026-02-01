"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, ListTodo } from "lucide-react"

interface ProjectTabsProps {
  projectId: string
  rightContent?: React.ReactNode
}

export function ProjectTabs({ projectId, rightContent }: ProjectTabsProps) {
  const pathname = usePathname()
  
  const tabs = [
    {
      name: "Overview",
      href: `/projects/${projectId}`,
      icon: LayoutGrid,
      isActive: pathname === `/projects/${projectId}`,
    },
    {
      name: "Tasks",
      href: `/projects/${projectId}/tasks`,
      icon: ListTodo,
      isActive: pathname.includes(`/projects/${projectId}/tasks`),
    },
  ]

  return (
    <div className="border-b border-border">
      <div className={cn(
        "flex items-center gap-1",
        rightContent && "justify-between"
      )}>
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors relative",
                  "hover:text-foreground",
                  tab.isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
                {tab.isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                )}
              </Link>
            )
          })}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </div>
  )
}
