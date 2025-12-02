"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  FolderKanban,
  Scale,
  Shield,
  Plug,
  Settings,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useSidebar } from "./sidebar-context"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Legal Review",
    href: "/legal",
    icon: Scale,
  },
  {
    title: "Insurance Risk",
    href: "/insurance",
    icon: Shield,
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Determine which logo to use based on theme
  const isDark = resolvedTheme === "dark" || theme === "dark"
  const logoIcon = isDark 
    ? "/logo/creation-rights%20logo%20icon%20white.svg"
    : "/logo/creation-rights%20logo%20icon%20black.svg"
  const logoLandscape = isDark
    ? "/logo/creation-rights%20logo%20landscape%20white.svg"
    : "/logo/creation-rights%20logo%20landscape%20black.svg"
  
  // Prevent hydration mismatch by showing a placeholder until mounted
  if (!mounted) {
    return (
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 hidden md:block",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border px-4" />
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 hidden md:block",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center">
              <Image
                src={logoLandscape}
                alt="Creation Rights"
                width={180}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <Image
                src={logoIcon}
                alt="CR"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
          </div>

          <Separator className="my-4" />

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              pathname === "/settings"
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full", collapsed && "px-2")}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}

