"use client"

import { Search, Bell, Moon, Sun, ChevronDown, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationCenter } from "@/components/cr"
import { QuickSearchOverlay } from "@/components/search/QuickSearchOverlay"
import { useSearchShortcuts } from "@/contexts/search-shortcuts-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import Link from "next/link"
import { MobileNav } from "./MobileNav"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { searchOpen, setSearchOpen } = useSearchShortcuts()

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border glass shadow-modern px-3 md:px-4">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Left side - Search trigger (opens QuickSearchOverlay) */}
        <div className="flex items-center flex-1 min-w-0">
          <Button
            variant="ghost"
            className="h-8 flex items-center gap-2 text-muted-foreground hover:text-foreground min-w-0 flex-1 justify-start max-w-md"
            onClick={() => setSearchOpen(true)}
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate text-sm">Search projects, assets...</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shrink-0 ml-1">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="sm" className="hidden md:flex text-xs">
            Documentation
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 gap-1.5 rounded-full pl-1.5 pr-2 md:pr-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>LT</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">Legal Team</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Legal Team</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    legal@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Team Management</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <QuickSearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
