"use client";

import { useState, useCallback } from "react";
import { Link2, UserPlus, Presentation, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Storyboard, StoryboardCollaborator } from "@/types/storyboard";

const ROLE_OPTIONS: { value: StoryboardCollaborator["role"]; label: string }[] = [
  { value: "editor", label: "Editor" },
  { value: "reviewer", label: "Reviewer" },
  { value: "viewer", label: "Viewer" },
];

export interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storyboard: Storyboard;
  /** If provided, called when user adds a collaborator. Otherwise show toast. */
  onAddCollaborator?: (email: string, name: string, role: "editor" | "reviewer" | "viewer") => void;
}

export function ShareDialog({
  isOpen,
  onClose,
  storyboard,
  onAddCollaborator,
}: ShareDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "reviewer" | "viewer">("viewer");
  const [copiedLink, setCopiedLink] = useState<"view" | "present" | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const viewLink = `${baseUrl}/storyboards/${storyboard.id}/view`;
  const presentLink = `${baseUrl}/storyboards/${storyboard.id}/present`;

  const copyToClipboard = useCallback(async (url: string, which: "view" | "present") => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(which);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }, []);

  const handleAddCollaborator = useCallback(() => {
    const email = inviteEmail.trim();
    const name = inviteName.trim() || email;
    if (!email) {
      toast.error("Enter an email address");
      return;
    }
    if (onAddCollaborator) {
      onAddCollaborator(email, name, inviteRole);
      setInviteEmail("");
      setInviteName("");
      toast.success(`Invitation sent to ${name}`);
    } else {
      toast.info("Collaborator invite (demo). Connect backend to persist.");
    }
  }, [inviteEmail, inviteName, inviteRole, onAddCollaborator]);

  const collaborators = storyboard.collaborators ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <p className="text-sm text-muted-foreground truncate" title={storyboard.title}>
            {storyboard.title}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share links */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              Share link (read-only)
            </div>
            <div className="flex gap-2">
              <Input readOnly value={viewLink} className="text-xs font-mono bg-muted/50" />
              <Button
                size="icon"
                variant="outline"
                className="shrink-0"
                onClick={() => copyToClipboard(viewLink, "view")}
                aria-label="Copy view link"
              >
                {copiedLink === "view" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the storyboard in read-only mode.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Presentation className="h-4 w-4 text-muted-foreground" />
              Present mode
            </div>
            <div className="flex gap-2">
              <Input readOnly value={presentLink} className="text-xs font-mono bg-muted/50" />
              <Button
                size="icon"
                variant="outline"
                className="shrink-0"
                onClick={() => copyToClipboard(presentLink, "present")}
                aria-label="Copy present link"
              >
                {copiedLink === "present" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Full-screen slideshow for client presentations.
            </p>
          </div>

          {/* Collaborators */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              Collaborators
            </div>
            {collaborators.length > 0 && (
              <ul className="rounded-md border divide-y">
                {collaborators.map((c) => (
                  <li key={c.userId} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground capitalize">{c.role}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2">
              <Label className="text-xs">Add by email or name</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 min-w-[120px]"
                />
                <Input
                  placeholder="Name (optional)"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="flex-1 min-w-[100px]"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "editor" | "reviewer" | "viewer")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Permission" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleAddCollaborator}>
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Editor: full edit. Reviewer: comment & approve. Viewer: read-only.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
