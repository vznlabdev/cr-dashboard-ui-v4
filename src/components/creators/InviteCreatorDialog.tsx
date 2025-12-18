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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { UserPlus, Loader2, Mail } from "lucide-react"
import type { CreatorType } from "@/types/creators"
import { isValidEmail } from "@/lib/creator-utils"

interface InviteCreatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteCreatorDialog({ open, onOpenChange }: InviteCreatorDialogProps) {
  const { inviteCreator, checkDuplicateInvitation, checkEmailExists } = useCreators()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    creatorType: "" as CreatorType | "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Invalid email format")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    // Check for duplicates
    if (checkDuplicateInvitation(formData.email)) {
      toast.error("An invitation has already been sent to this email")
      return
    }

    if (checkEmailExists(formData.email)) {
      toast.error("This email is already registered")
      return
    }

    setIsSubmitting(true)

    try {
      const invitation = await inviteCreator({
        email: formData.email.trim(),
        name: formData.name.trim(),
        creatorType: formData.creatorType || undefined,
      })

      toast.success(`Invitation sent to ${formData.email}`)

      // Reset form
      setFormData({
        email: "",
        name: "",
        creatorType: "",
      })

      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send invitation"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Creator
          </DialogTitle>
          <DialogDescription>
            Send an invitation link to a creator to create their account and complete their profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="creator@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-muted-foreground">
                The creator will receive an invitation link at this email address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorType">Creator Type (Optional)</Label>
              <Select
                value={formData.creatorType}
                onValueChange={(value) =>
                  setFormData({ ...formData, creatorType: value as CreatorType })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="creatorType">
                  <SelectValue placeholder="Select type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Real Person">Real Person</SelectItem>
                  <SelectItem value="Character">Character</SelectItem>
                  <SelectItem value="Brand Mascot">Brand Mascot</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will pre-fill the creator type when they create their account.
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

