"use client"

import { useState, useMemo } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { UserPlus, Loader2, Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRightsStatusVariant, formatCreatorExpiration } from "@/lib/creator-utils"

interface CreditCreatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId?: string
  projectId?: string
  onSuccess?: () => void
}

export function CreditCreatorDialog({
  open,
  onOpenChange,
  assetId,
  projectId,
  onSuccess,
}: CreditCreatorDialogProps) {
  const { creators, creditCreatorToAsset, creditCreatorToProject } = useCreators()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("")
  const [role, setRole] = useState<string>("")

  // Filter creators by search
  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return creators

    const query = searchQuery.toLowerCase()
    return creators.filter(
      (c) =>
        c.fullName.toLowerCase().includes(query) ||
        c.creatorRightsId.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    )
  }, [creators, searchQuery])

  const selectedCreator = creators.find((c) => c.id === selectedCreatorId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCreatorId) {
      toast.error("Please select a creator")
      return
    }

    setIsSubmitting(true)

    try {
      if (assetId) {
        await creditCreatorToAsset(selectedCreatorId, assetId, role || undefined)
      } else if (projectId) {
        await creditCreatorToProject(selectedCreatorId, projectId, role || undefined)
      } else {
        throw new Error("Either assetId or projectId must be provided")
      }

      // Reset form
      setSearchQuery("")
      setSelectedCreatorId("")
      setRole("")

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to credit creator"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Authorized":
        return <CheckCircle2 className="h-3 w-3" />
      case "Expiring Soon":
        return <Clock className="h-3 w-3" />
      case "Expired":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Credit Creator
          </DialogTitle>
          <DialogDescription>
            Select a creator to credit for this {assetId ? "asset" : "project"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Creators</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, CR ID, or email..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Creator Selection */}
            <div className="space-y-2">
              <Label>
                Select Creator <span className="text-destructive">*</span>
              </Label>
              <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                {filteredCreators.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No creators found
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredCreators.map((creator) => (
                      <button
                        key={creator.id}
                        type="button"
                        onClick={() => setSelectedCreatorId(creator.id)}
                        className={cn(
                          "w-full p-3 text-left hover:bg-accent transition-colors",
                          selectedCreatorId === creator.id && "bg-accent"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{creator.fullName}</p>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              {creator.creatorRightsId}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge
                              variant={getRightsStatusVariant(creator.rightsStatus)}
                              className="text-xs flex items-center gap-1"
                            >
                              {getStatusIcon(creator.rightsStatus)}
                              {creator.rightsStatus}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Creator Info */}
            {selectedCreator && (
              <div className="p-3 rounded-lg bg-muted space-y-2">
                <p className="text-sm font-medium">Selected: {selectedCreator.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCreatorExpiration(selectedCreator.validThrough)}
                </p>
              </div>
            )}

            {/* Role (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="role">Credit Role (Optional)</Label>
              <Input
                id="role"
                placeholder="e.g., Voice Actor, Character Model, Brand Mascot"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Specify the role or type of credit for this creator.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedCreatorId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Crediting...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Credit Creator
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

