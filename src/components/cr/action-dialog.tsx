"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export type ActionType = "approve" | "reject" | "flag";

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ActionType;
  itemName: string;
  onConfirm: (notes?: string) => void;
}

const actionConfig = {
  approve: {
    title: "Approve Asset",
    description: "This will mark the asset as approved and ready for production use.",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    confirmText: "Approve",
    confirmVariant: "default" as const,
  },
  reject: {
    title: "Reject Asset",
    description: "This will reject the asset and require revisions before resubmission.",
    icon: XCircle,
    iconColor: "text-destructive",
    confirmText: "Reject",
    confirmVariant: "destructive" as const,
  },
  flag: {
    title: "Flag for Review",
    description: "This will flag the asset for additional legal or compliance review.",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    confirmText: "Flag",
    confirmVariant: "secondary" as const,
  },
};

export function ActionDialog({
  open,
  onOpenChange,
  actionType,
  itemName,
  onConfirm,
}: ActionDialogProps) {
  const [notes, setNotes] = useState("");
  const config = actionConfig[actionType];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Asset</Label>
            <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              {itemName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder={`Add notes about this ${actionType}...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant={config.confirmVariant} onClick={handleConfirm}>
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

