import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * PageContainer Component
 * 
 * Provides consistent max-width container for page content.
 * Use this for all standard pages to maintain layout consistency.
 * 
 * For special layouts (like full-width Kanban), don't use this component.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full", className)}>
      {children}
    </div>
  )
}

