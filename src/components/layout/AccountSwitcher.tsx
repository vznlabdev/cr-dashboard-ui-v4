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
import { Building2, ChevronsUpDown, Check } from "lucide-react"
import { useSidebar } from "./sidebar-context"
import { useAccount } from "@/contexts/account-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AccountSwitcherProps {
  variant?: "sidebar" | "mobile"
}

export function AccountSwitcher({ variant = "sidebar" }: AccountSwitcherProps) {
  const { collapsed } = useSidebar()
  const { currentCompany, setCompany, getAllCompanies } = useAccount()

  const isMobile = variant === "mobile"
  const isCollapsed = !isMobile && collapsed
  const companies = getAllCompanies()

  const handleCompanyChange = (companyId: string) => {
    if (companyId !== currentCompany?.id) {
      setCompany(companyId)
    }
  }

  // Fallback if no company is selected
  const displayCompany = currentCompany || companies[0]

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
          {displayCompany?.logo ? (
            <Avatar className="h-4 w-4">
              <AvatarImage src={displayCompany.logo} alt={displayCompany.name} />
              <AvatarFallback className="text-xs">
                {displayCompany.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
          )}
          {!isCollapsed && (
            <span className="truncate">{displayCompany?.name || "Company"}</span>
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
          Switch Company
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => {
          const isActive = company.id === displayCompany?.id

          return (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleCompanyChange(company.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 py-2.5",
                isActive && "bg-accent"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {company.logo ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={company.logo} alt={company.name} />
                    <AvatarFallback className="text-xs">
                      {company.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium">{company.name}</span>
                {company.description && (
                  <span className="text-xs text-muted-foreground">
                    {company.description}
                  </span>
                )}
                {company.industry && (
                  <span className="text-xs text-muted-foreground">
                    {company.industry}
                  </span>
                )}
              </div>
              {isActive && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          Company Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          Add Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

