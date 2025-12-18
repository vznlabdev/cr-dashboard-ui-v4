"use client"

import { CreatorAvatarBadge } from "./CreatorAvatarBadge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Creator } from "@/types/creators"

interface CreatorAvatarsGroupProps {
  creators: Creator[]
  maxVisible?: number
  showLabel?: boolean
  className?: string
}

export function CreatorAvatarsGroup({
  creators,
  maxVisible = 4,
  showLabel = true,
  className,
}: CreatorAvatarsGroupProps) {
  if (creators.length === 0) {
    return null
  }

  const visibleCreators = creators.slice(0, maxVisible)
  const remainingCount = creators.length - maxVisible

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {showLabel && (
        <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>Credited Creators:</span>
        </span>
      )}
      
      <div className="flex items-center gap-2 -space-x-2">
        {visibleCreators.map((creator) => (
          <CreatorAvatarBadge
            key={creator.id}
            creator={creator}
            size="sm"
            className="hover:z-10 relative"
          />
        ))}
        
        {remainingCount > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-8 rounded-full p-0 text-xs font-medium",
                  "hover:z-10 relative border-2 border-background"
                )}
              >
                +{remainingCount}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <div className="space-y-2">
                <div className="font-medium text-sm mb-3 px-2">
                  All Credited Creators ({creators.length})
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {creators.map((creator) => (
                    <div key={creator.id} className="px-2">
                      <CreatorAvatarBadge
                        creator={creator}
                        showName={true}
                        size="sm"
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

