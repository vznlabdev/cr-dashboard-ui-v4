"use client"

import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { useSidebar } from "./sidebar-context"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="relative flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <div 
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 w-full min-w-0 h-screen overflow-y-auto",
          "md:pl-60", // Desktop: sidebar padding
          collapsed && "md:pl-16" // Desktop collapsed: smaller padding
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden w-full">
          <div className="mx-auto max-w-7xl w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

