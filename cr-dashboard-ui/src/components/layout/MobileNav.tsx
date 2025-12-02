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
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

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
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()

  // Determine which logo to use based on theme
  const logoIcon = theme === "dark" 
    ? "/logo/creation-rights logo icon white.svg"
    : "/logo/creation-rights logo icon black.svg"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-left">
            <Link href="/" className="flex items-center justify-start">
              <Image
                src={logoIcon}
                alt="Creation Rights"
                width={48}
                height={48}
                className="h-12 w-12"
                priority
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

