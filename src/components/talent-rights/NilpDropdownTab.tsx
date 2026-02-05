"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Shield, Image as ImageIcon, Users, Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface NilpDropdownTabProps {
  currentTab: string
  onTabChange: (value: string) => void
}

const nilpCategories = [
  {
    id: "name",
    label: "Name Rights",
    icon: Shield,
  },
  {
    id: "image",
    label: "Image Rights",
    icon: ImageIcon,
  },
  {
    id: "likeness",
    label: "Likeness",
    icon: Users,
  },
  {
    id: "persona",
    label: "Persona™",
    icon: Sparkles,
  },
]

export function NilpDropdownTab({ currentTab, onTabChange }: NilpDropdownTabProps) {
  const [open, setOpen] = useState(false)
  
  // Check if any NILP™ category is active
  const nilpCategoryIds = nilpCategories.map(cat => cat.id)
  const isNilpActive = nilpCategoryIds.includes(currentTab)
  
  // Get the active category label for display
  const activeCategory = nilpCategories.find(cat => cat.id === currentTab)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium transition-colors hover:text-foreground h-auto rounded-none",
            isNilpActive
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          <span>NILP™</span>
          {activeCategory && (
            <span className="text-xs text-muted-foreground">
              · {activeCategory.label}
            </span>
          )}
          <ChevronDown className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )} />
          {isNilpActive && (
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary rounded-t-sm" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56"
      >
        {nilpCategories.map((category) => {
          const Icon = category.icon
          const isActive = currentTab === category.id
          
          return (
            <DropdownMenuItem
              key={category.id}
              onClick={() => {
                onTabChange(category.id)
                setOpen(false)
              }}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                isActive && "bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{category.label}</span>
              {isActive && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
