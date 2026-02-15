"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import type { WorkflowStepType, WhitelistedTool } from "@/types/workflow-builder";
import { getStepTypeLabel } from "@/lib/workflow-step-config";
import type { WorkflowStepType as LegacyWorkflowStepType } from "@/types/workflows";

export type ToolRequestPriority = "low" | "medium" | "high";

interface ToolRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepType: WorkflowStepType;
  existingTools: WhitelistedTool[];
}

const PRIORITY_OPTIONS: { value: ToolRequestPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ToolRequestModal({
  isOpen,
  onClose,
  stepType,
  existingTools,
}: ToolRequestModalProps) {
  const [toolName, setToolName] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<ToolRequestPriority>("medium");

  const resetForm = useCallback(() => {
    setToolName("");
    setToolUrl("");
    setReason("");
    setPriority("medium");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = toolName.trim();
      if (!trimmedName) {
        toast.error("Tool name is required");
        return;
      }
      toast.success("Request submitted");
      handleClose();
    },
    [toolName, handleClose]
  );

  const stepTypeLabel = getStepTypeLabel(stepType as LegacyWorkflowStepType);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Tool Access</DialogTitle>
          <DialogDescription>
            Submit a request to your admin to add a new AI tool. This step type:
            {stepTypeLabel ? ` ${stepTypeLabel}` : ""}. {existingTools.length} tool
            {existingTools.length !== 1 ? "s" : ""} already available.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool-request-name">
              Tool name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tool-request-name"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g. New AI Image Tool"
              required
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tool-request-url">Tool URL</Label>
            <Input
              id="tool-request-url"
              type="url"
              value={toolUrl}
              onChange={(e) => setToolUrl(e.target.value)}
              placeholder="https://..."
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tool-request-reason">Why do you need this?</Label>
            <Textarea
              id="tool-request-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief justification for your team..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(v) => setPriority(v as ToolRequestPriority)}
              className="flex gap-4"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
