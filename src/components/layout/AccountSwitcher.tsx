"use client"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, ChevronsUpDown } from "lucide-react"
import { useSidebar } from "./sidebar-context"

interface AccountSwitcherProps {
  variant?: "sidebar" | "mobile"
}

export function AccountSwitcher({ variant = "sidebar" }: AccountSwitcherProps) {
  const { collapsed } = useSidebar()

  const isMobile = variant === "mobile"
  const isCollapsed = !isMobile && collapsed

  // TODO: Replace with actual account data from auth context
  const accountName = "My Account"
  const accountEmail = "user@example.com"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm font-medium transition-all",
          "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isCollapsed ? "w-10 justify-center px-0" : "w-full justify-between",
          isMobile && "w-full justify-between"
        )}
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 shrink-0 text-primary" />
          {!isCollapsed && (
            <span className="truncate">{accountName}</span>
          )}
        </div>
        {!isCollapsed && (
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isCollapsed ? "start" : "start"}
        side={isMobile ? "bottom" : "right"}
        sideOffset={8}
        className="w-64"
      >
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{accountName}</p>
          <p className="text-xs text-muted-foreground">{accountEmail}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

