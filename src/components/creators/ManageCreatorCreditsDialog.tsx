"use client"

import { useState } from "react"
import { useCreators } from "@/contexts/creators-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { UserPlus, ExternalLink, Trash2 } from "lucide-react"
import { EmptyState } from "@/components/cr"
import Link from "next/link"
import { formatDateLong } from "@/lib/format-utils"

interface ManageCreatorCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId?: string
  projectId?: string
  onSuccess?: () => void
}

export function ManageCreatorCreditsDialog({
  open,
  onOpenChange,
  assetId,
  projectId,
  onSuccess,
}: ManageCreatorCreditsDialogProps) {
  const {
    getCreatorsByAsset,
    getCreatorsByProject,
    removeAssetCredit,
    removeProjectCredit,
  } = useCreators()

  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const creditedCreators = assetId
    ? getCreatorsByAsset(assetId)
    : projectId
    ? getCreatorsByProject(projectId)
    : []

  const handleRemoveCredit = async (creatorId: string) => {
    setIsRemoving(creatorId)

    try {
      if (assetId) {
        await removeAssetCredit(creatorId, assetId)
      } else if (projectId) {
        await removeProjectCredit(creatorId, projectId)
      }

      toast.success("Credit removed")
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to remove credit")
    } finally {
      setIsRemoving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Credits</DialogTitle>
          <DialogDescription>
            View and manage creators credited on this {assetId ? "asset" : "project"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {creditedCreators.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No creators credited"
              description={`No creators are currently credited on this ${assetId ? "asset" : "project"}.`}
            />
          ) : (
            <div className="space-y-2">
              {creditedCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{creator.fullName}</p>
                      <Badge variant="outline" className="text-xs font-mono">
                        {creator.creatorRightsId}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{creator.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCredit(creator.id)}
                      disabled={isRemoving === creator.id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

