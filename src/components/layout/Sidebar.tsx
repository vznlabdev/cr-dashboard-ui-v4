"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Scale,
  Shield,
  Settings,
  ChevronLeft,
  Ticket,
  Palette,
  Users,
  User,
  FileImage,
  FolderKanban,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useSidebar } from "./sidebar-context"
import { AccountSwitcher } from "./AccountSwitcher"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// Navigation items
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
    title: "Tasks",
    href: "/tasks",
    icon: Ticket,
  },
  {
    title: "Brands",
    href: "/creative/brands",
    icon: Palette,
  },
  {
    title: "Assets",
    href: "/creative/assets",
    icon: FileImage,
  },
  {
    title: "Creators",
    href: "/creative/creators",
    icon: User,
  },
  {
    title: "Asset Approvals",
    href: "/creative/assets/approvals",
    icon: CheckCircle2,
  },
  {
    title: "Team",
    href: "/creative/team",
    icon: Users,
  },
  {
    title: "Legal",
    href: "/legal",
    icon: Scale,
  },
  {
    title: "Insurance",
    href: "/insurance",
    icon: Shield,
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
          "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-300 hidden md:block",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b border-border/50 px-3" />
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-300 hidden md:block",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border/50 px-3">
          {!collapsed && (
            <Link href="/" className="flex items-center">
              <Image
                src={logoLandscape}
                alt="Creation Rights"
                width={180}
                height={32}
                className="h-7 w-auto"
                priority
              />
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <Image
                src={logoIcon}
                alt="CR"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
            </Link>
          )}
        </div>

        {/* Account Switcher */}
        <div className="px-2 pt-2 pb-1">
          <AccountSwitcher variant="sidebar" />
        </div>

        {/* Navigation - Linear Style */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              // Check if this is the home page
              const isHome = item.href === "/"
              const isActive = isHome 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent/50 text-foreground"
                      : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
          </div>

          <div className="my-3 h-px bg-border/50" />

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-accent/50 text-foreground"
                : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </nav>

        {/* Collapse Toggle - Linear Style */}
        <div className="border-t border-border/50 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors w-full",
              "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

