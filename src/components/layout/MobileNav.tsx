"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Scale,
  Shield,
  ShieldCheck,
  Settings,
  Ticket,
  Palette,
  Users,
  User,
  FileImage,
  FolderKanban,
  CheckCircle2,
  Inbox,
  BarChart3,
  Menu,
  FileText,
  FileSearch,
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  ScanSearch,
  Calculator,
  Archive,
  MapPin,
  AlertTriangle,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { AccountSwitcher } from "./AccountSwitcher"
import { Separator } from "@/components/ui/separator"
import { useSetup } from "@/lib/contexts/setup-context"
import { useInbox } from "@/lib/contexts/inbox-context"
import { getAllMenuItems } from "@/lib/settings-menu"
import { ChevronLeft } from "lucide-react"


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

// Base navigation sections (same as Sidebar.tsx)
const baseNavSections: NavSection[] = [
  // Personal section (Inbox badge will be dynamically set)
  {
    items: [
      {
        title: "Inbox",
        href: "/inbox",
        icon: Inbox,
        badge: 0, // Will be replaced with actual unreadCount
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
        title: "Talent Rights",
        href: "/creative/talent-rights",
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

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
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

  // Conditionally add setup item and update inbox badge (same logic as Sidebar)
  const navSections = useMemo((): NavSection[] => {
    // Don't show setup during SSR to avoid hydration mismatch
    if (!mounted) {
      return baseNavSections
    }

    // Update Inbox badge with actual unread count
    const sectionsWithInboxBadge: NavSection[] = baseNavSections.map((section, idx) => {
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 pb-3 border-b border-border/50">
          <SheetTitle className="text-left">
            <Link href="/" className="flex items-center justify-start">
              <Image
                src={logoIcon}
                alt="Creation Rights"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        
        {/* Account Switcher */}
        <div className="px-3 pt-3 pb-2">
          <AccountSwitcher variant="mobile" />
        </div>

        {/* Navigation - Linear Style with Sections */}
        <nav className="flex flex-col px-3 py-2 overflow-y-auto">
          {isSettingsRoute ? (
            // Settings Menu
            <>
              {/* Back to app button */}
              <Link
                href="/inbox"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-150 mb-4",
                  "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
                <span>Back to app</span>
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
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span>{item.label}</span>
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
                  {/* Section Label */}
                  {section.label && (
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.label}
                    </div>
                  )}
                  
                  {/* Section Items */}
                  <div className="space-y-px">
                    {section.items.map((item) => {
                      const hasChildren = item.children && item.children.length > 0
                      if (hasChildren) {
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
                                "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-150 w-full text-left",
                                isParentActive
                                  ? "bg-accent text-foreground"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              )}
                            >
                              <Icon className="h-[18px] w-[18px] shrink-0" />
                              <span className="flex-1">{item.title}</span>
                              {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : true) && (
                                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-medium rounded-md bg-orange-600 text-white">
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
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "flex items-center gap-3 rounded-md py-2.5 pl-8 pr-3 text-sm font-medium transition-all duration-150",
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
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-150",
                            isActive
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          )}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : true) && (
                            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-medium rounded-md bg-blue-600 text-white">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>

                  {/* Spacing between sections */}
                  {sectionIndex < navSections.length - 1 && (
                    <div className="h-3" />
                  )}
                </div>
              ))}

              {/* Separator before Settings */}
              <Separator className="my-3" />

              {/* Settings - always shown at bottom */}
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-150",
                  pathname.startsWith("/settings")
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" />
                <span>Settings</span>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
