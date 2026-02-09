"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Scale,
  Shield,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronDown,
  Ticket,
  Palette,
  Users,
  User,
  FileImage,
  FolderKanban,
  GitBranch,
  CheckCircle2,
  Inbox,
  BarChart3,
  FileText,
  FileSearch,
  LayoutDashboard,
  BookOpen,
  ScanSearch,
  Calculator,
  Archive,
  MapPin,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useSidebar } from "./sidebar-context"
import { AccountSwitcher } from "./AccountSwitcher"
import { useSetup } from "@/lib/contexts/setup-context"
import { useInbox } from "@/lib/contexts/inbox-context"
import { getAllMenuItems } from "@/lib/settings-menu"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
  children?: NavItem[]
}

interface NavSection {
  label?: string
  items: NavItem[]
}

// Base navigation sections (will be modified dynamically for setup)
const baseNavSections: NavSection[] = [
  // Top nav (no label) — Inbox badge will be dynamically set
  {
    items: [
      { title: "Inbox",      href: "/inbox",      icon: Inbox,       badge: 0 },
      { title: "Projects",   href: "/projects",   icon: FolderKanban },
      { title: "Tasks",      href: "/tasks",      icon: Ticket },
    ]
  },
  // Workspace section
  {
    label: "Workspace",
    items: [
      { title: "Assets",         href: "/creative/assets",        icon: FileImage },
      { title: "Talent Rights",   href: "/creative/talent-rights",  icon: User },
      { title: "Workflows",      href: "/workflows",               icon: GitBranch },
      { title: "Brands",         href: "/creative/brands",         icon: Palette },
      { title: "Team",           href: "/creative/team",           icon: Users },
    ]
  },
  // Compliance section
  {
    label: "Compliance",
    items: [
      {
        title: "Compliance",
        href: "/compliance",
        icon: ShieldCheck,
        badge: 7,
        children: [
          { title: "Dashboards", href: "/compliance", icon: LayoutDashboard },
          { title: "ALCAR Registry", href: "/compliance/alcar", icon: BookOpen },
          { title: "KYA Profiler", href: "/compliance/kya", icon: ScanSearch },
          { title: "Scoring", href: "/compliance/scoring", icon: Calculator },
          { title: "Evidence", href: "/compliance/evidence", icon: Archive },
          { title: "Jurisdictions", href: "/compliance/jurisdictions", icon: MapPin },
          { title: "Distribution Risk", href: "/compliance/distribution-risk", icon: AlertTriangle },
        ],
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
  // Analytics section
  {
    label: "Analytics",
    items: [
      {
        title: "Analytics",
        href: "/reports",
        icon: BarChart3,
        children: [
          { title: "Dashboards", href: "/analytics/dashboards", icon: LayoutDashboard },
          { title: "Reports", href: "/reports", icon: BarChart3 },
          { title: "Usage", href: "/analytics/usage", icon: FileText },
          { title: "Audit Logs", href: "/analytics/audit", icon: FileSearch },
        ],
      },
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const { theme, resolvedTheme } = useTheme()
  const { isSetupComplete, isDismissed, progress } = useSetup()
  const { unreadCount } = useInbox()
  
  // Check if we're in settings mode
  const isSettingsRoute = pathname.startsWith('/settings')
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-expand sections when on a child route so current page is visible
  useEffect(() => {
    const updates: Record<string, boolean> = {}
    if (pathname === "/reports" || pathname.startsWith("/analytics/")) {
      updates["/reports"] = true
    }
    if (pathname.startsWith("/compliance")) {
      updates["/compliance"] = true
    }
    if (Object.keys(updates).length > 0) {
      setExpandedSections((prev) => ({ ...prev, ...updates }))
    }
  }, [pathname])

  // Conditionally add setup item above Inbox (only after client mount to avoid hydration issues)
  const navSections = useMemo((): NavSection[] => {
    // Don't show setup during SSR to avoid hydration mismatch
    if (!mounted) {
      return baseNavSections
    }
    
    // Update Inbox badge with actual unread count
    const sectionsWithInboxBadge = baseNavSections.map((section, idx) => {
      if (idx === 0) { // Personal section
        return {
          ...section,
          items: section.items.map((item) =>
            item.href === '/inbox' ? { ...item, badge: unreadCount } : item
          ),
        }
      }
      return section
    })
    
    const showSetup = !isSetupComplete && !isDismissed
    
    if (!showSetup) {
      return sectionsWithInboxBadge
    }
    
    // Add setup item at the beginning
    const setupSection: NavSection = {
      items: [
        {
          title: "Setup",
          href: "/setup",
          icon: CheckCircle2,
          badge: progress,
        },
      ],
    }
    return [
      setupSection,
      ...sectionsWithInboxBadge,
    ]
  }, [mounted, isSetupComplete, isDismissed, progress, unreadCount])
  
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
          {isSettingsRoute ? (
            // Settings Menu
            <>
              {/* Back to app button */}
              <Link
                href="/inbox"
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-normal transition-all duration-150 mb-4",
                  "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? "Back to app" : undefined}
              >
                <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>Back to app</span>}
              </Link>

              {/* Flat list of all settings */}
              <div className="space-y-px">
                {getAllMenuItems().map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-normal transition-all duration-150",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </>
          ) : (
            // Normal Navigation
            <>
              {navSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Items */}
                  <div className="space-y-px">
                    {section.items.map((item) => {
                      const hasChildren = item.children && item.children.length > 0
                      if (hasChildren && !collapsed) {
                        const Icon = item.icon
                        const isParentActive = item.children!.some(
                          (c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(c.href))
                        )
                        const isExpanded = !!expandedSections[item.href]
                        return (
                          <div key={item.href}>
                            <button
                              type="button"
                              onClick={() => setExpandedSections((prev) => ({ ...prev, [item.href]: !prev[item.href] }))}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-normal transition-all duration-150 relative group w-full text-left",
                                isParentActive
                                  ? "bg-accent text-foreground"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              )}
                              title={item.title}
                            >
                              <Icon className="h-[18px] w-[18px] shrink-0" />
                              <span className="flex-1">{item.title}</span>
                              {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : true) && (
                                <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-medium rounded-md bg-orange-600 text-white">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronDown className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
                                isExpanded ? "rotate-0" : "-rotate-90"
                              )} />
                            </button>
                            {isExpanded && item.children!.map((child) => {
                              const isActive = pathname === child.href || (child.href !== "/" && pathname.startsWith(child.href))
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md py-1.5 pl-6 pr-2 text-[13px] font-normal transition-all duration-150",
                                    isActive
                                      ? "bg-accent text-foreground"
                                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                  )}
                                >
                                  <span className="flex-1">{child.title}</span>
                                </Link>
                              )
                            })}
                          </div>
                        )
                      }
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
                  pathname.startsWith("/settings")
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? "Settings" : undefined}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </>
          )}
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

