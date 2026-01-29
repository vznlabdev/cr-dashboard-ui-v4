"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Scale,
  Shield,
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
  FileText,
  FileSearch,
  Menu,
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

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const { isSetupComplete, isDismissed, progress } = useSetup()
  const { unreadCount } = useInbox()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Conditionally add setup item and update inbox badge (same logic as Sidebar)
  const navSections = useMemo(() => {
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
              pathname === "/settings"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            <span>Settings</span>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
