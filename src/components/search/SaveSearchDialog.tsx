"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SearchQuery, SearchEntityType } from "@/types/search";

const ENTITY_LABELS: Record<SearchEntityType | "all", string> = {
  all: "All",
  asset: "Assets",
  project: "Projects",
  task: "Tasks",
  workflow: "Workflows",
  storyboard: "Storyboards",
  brand: "Brands",
  talent: "Talent",
  team_member: "Team",
  compliance: "Compliance",
  contract: "Contracts",
  insurance: "Insurance",
};

export interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuery: SearchQuery;
  onSave: (name: string, isShared: boolean) => void;
}

export function SaveSearchDialog({
  open,
  onOpenChange,
  currentQuery,
  onSave,
}: SaveSearchDialogProps) {
  const [name, setName] = useState("");
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setIsShared(false);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, isShared);
    onOpenChange(false);
  };

  const filterSummary =
    currentQuery.filters.length > 0
      ? currentQuery.filters.map((f) => `${f.field}: ${f.label}`).join(", ")
      : null;
  const tabLabel = ENTITY_LABELS[currentQuery.entityType] ?? currentQuery.entityType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="save-search-name">Name</Label>
            <Input
              id="save-search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Critical compliance alerts"
              className="w-full"
            />
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm space-y-1">
            {currentQuery.text.trim() && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Query:</span>{" "}
                &quot;{currentQuery.text.trim()}&quot;
              </p>
            )}
            {filterSummary && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Filters:</span>{" "}
                {filterSummary}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Tab:</span> {tabLabel}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="save-search-shared"
              checked={isShared}
              onCheckedChange={(c) => setIsShared(c === true)}
            />
            <Label
              htmlFor="save-search-shared"
              className="text-sm font-normal cursor-pointer"
            >
              Share with organization
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
