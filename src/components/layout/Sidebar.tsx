"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
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
  Inbox,
  BarChart3,
  FileText,
  FileSearch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useSidebar } from "./sidebar-context"
import { AccountSwitcher } from "./AccountSwitcher"
import { useSetup } from "@/lib/contexts/setup-context"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
}

interface NavSection {
  label?: string
  items: NavItem[]
}

// Base navigation sections (will be modified dynamically for setup)
const baseNavSections: NavSection[] = [
  // Personal section
  {
    items: [
      {
        title: "Inbox",
        href: "/inbox",
        icon: Inbox,
        badge: 1,
      },
      {
        title: "Tasks",
        href: "/tasks",
        icon: Ticket,
      },
    ]
  },
  // Workspace section
  {
    label: "Workspace",
    items: [
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
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
        title: "Team",
        href: "/creative/team",
        icon: Users,
      },
    ]
  },
  // Compliance section
  {
    label: "Compliance",
    items: [
      {
        title: "Asset Approvals",
        href: "/creative/assets/approvals",
        icon: CheckCircle2,
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
  },
  // Reporting section
  {
    label: "Reporting",
    items: [
      {
        title: "Analytics",
        href: "/",
        icon: BarChart3,
      },
      {
        title: "Usage Reports",
        href: "/reporting/usage",
        icon: FileText,
      },
      {
        title: "Audit Logs",
        href: "/reporting/audit",
        icon: FileSearch,
      },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const { isSetupComplete, isDismissed, progress } = useSetup()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Conditionally add setup item above Inbox (only after client mount to avoid hydration issues)
  const navSections = useMemo(() => {
    // Don't show setup during SSR to avoid hydration mismatch
    if (!mounted) {
      return baseNavSections
    }
    
    const showSetup = !isSetupComplete && !isDismissed
    
    if (!showSetup) {
      return baseNavSections
    }
    
    // Add setup item at the beginning
    return [
      {
        items: [
          {
            title: "Setup",
            href: "/setup",
            icon: CheckCircle2,
            badge: progress,
          },
        ],
      },
      ...baseNavSections,
    ]
  }, [mounted, isSetupComplete, isDismissed, progress])
  
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
        <div className="px-2 py-2">
          <AccountSwitcher variant="sidebar" />
        </div>

        {/* Navigation - Linear Style */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Items */}
              <div className="space-y-px">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.href === "/" 
                    ? pathname === item.href 
                    : pathname.startsWith(item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-normal transition-all duration-150 relative group",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : true) && (
                            <span className="ml-auto inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-medium rounded-md bg-blue-600 text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : true) && (
                        <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-md bg-blue-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
              
              {/* Minimal spacing between sections */}
              {sectionIndex < navSections.length - 1 && (
                <div className="h-4" />
              )}
            </div>
          ))}

          {/* Minimal spacing before Settings */}
          <div className="h-4" />

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-normal transition-all duration-150",
              pathname === "/settings"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
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

