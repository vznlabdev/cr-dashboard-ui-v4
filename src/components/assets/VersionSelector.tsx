"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AssetVersionGroup, AssetVersion } from "@/types/creative"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface VersionSelectorProps {
  versionGroup: AssetVersionGroup
  currentVersionId: string
  onVersionChange: (versionId: string) => void
}

export function VersionSelector({
  versionGroup,
  currentVersionId,
  onVersionChange,
}: VersionSelectorProps) {
  const [open, setOpen] = useState(false)
  
  const currentVersion = versionGroup.versions.find(v => v.id === currentVersionId)
  
  if (!currentVersion) return null

  const getStatusBadge = (status: AssetVersion["status"]) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
      submitted: { label: "Submitted", className: "bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200" },
      client_review: { label: "Client Review", className: "bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-200" },
      client_approved: { label: "Client OK", className: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" },
      admin_review: { label: "Admin Review", className: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200" },
      approved: { label: "Approved", className: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" },
      rejected: { label: "Rejected", className: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200" },
    }
    return statusConfig[status] || statusConfig.draft
  }

  // Sort versions by version number descending (newest first)
  const sortedVersions = [...versionGroup.versions].sort((a, b) => b.versionNumber - a.versionNumber)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <h1 className="text-xl font-semibold flex items-center gap-2">
            {versionGroup.name}
            <span className="text-muted-foreground font-mono text-base">
              v{currentVersion.versionNumber}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )} />
          </h1>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[400px]">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          All Versions ({versionGroup.totalVersions})
        </div>
        {sortedVersions.map((version) => {
          const isCurrent = version.id === currentVersionId
          const statusBadge = getStatusBadge(version.status)
          
          return (
            <DropdownMenuItem
              key={version.id}
              onClick={() => {
                if (!isCurrent) {
                  onVersionChange(version.id)
                }
                setOpen(false)
              }}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                isCurrent && "bg-accent"
              )}
            >
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                {isCurrent && <Check className="h-4 w-4 text-primary" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">
                    v{version.versionNumber}
                  </span>
                  {version.id === versionGroup.currentVersionId && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                      Current
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={cn("h-4 px-1.5 text-[10px]", statusBadge.className)}
                  >
                    {statusBadge.label}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {version.changeNotes || version.description || "No description"}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{version.uploadedByName}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(version.uploadedAt, { addSuffix: true })}</span>
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
