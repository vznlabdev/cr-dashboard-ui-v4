"use client";

import { useState, useCallback } from "react";
import { Star, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SavedSearch, SearchEntityType } from "@/types/search";

const ENTITY_LABELS: Record<SearchEntityType | "all", string> = {
  all: "All",
  asset: "Assets",
  project: "Projects",
  task: "Tasks",
  workflow: "Workflows",
  brand: "Brands",
  talent: "Talent",
  team_member: "Team",
  compliance: "Compliance",
  contract: "Contracts",
  insurance: "Insurance",
};

function formatFilterSummary(saved: SavedSearch): string {
  const q = saved.query;
  const entityLabel = ENTITY_LABELS[q.entityType] ?? q.entityType;
  const parts = [entityLabel];
  for (const f of q.filters) {
    const fieldLabel = f.field.charAt(0).toUpperCase() + f.field.slice(1).replace(/([A-Z])/g, " $1").trim();
    parts.push(`${fieldLabel}: ${f.label}`);
  }
  return parts.join(" · ");
}

export interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
  onToggleShared: (id: string) => void;
  onRename?: (id: string, name: string) => void;
}

export function SavedSearches({
  savedSearches,
  onLoad,
  onDelete,
  onToggleShared,
  onRename,
}: SavedSearchesProps) {
  if (savedSearches.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-muted-foreground">Saved Searches</h3>
        <p className="mt-2 text-sm text-muted-foreground">No saved searches.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-muted-foreground">Saved Searches</h3>
      <ul className="mt-2 space-y-0 rounded-lg border border-border bg-card overflow-hidden divide-y divide-border">
        {savedSearches.map((saved) => (
          <SavedSearchCard
            key={saved.id}
            saved={saved}
            onLoad={() => onLoad(saved)}
            onDelete={() => onDelete(saved.id)}
            onToggleShared={() => onToggleShared(saved.id)}
            onRename={onRename ? (name) => onRename(saved.id, name) : undefined}
          />
        ))}
      </ul>
    </div>
  );
}

function SavedSearchCard({
  saved,
  onLoad,
  onDelete,
  onToggleShared,
  onRename,
}: {
  saved: SavedSearch;
  onLoad: () => void;
  onDelete: () => void;
  onToggleShared: () => void;
  onRename?: (name: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(saved.name);

  const handleSubmitRename = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== saved.name && onRename) {
      onRename(trimmed);
    }
    setIsEditing(false);
    setEditName(saved.name);
  }, [editName, saved.name, onRename]);

  return (
    <li>
      <div
        className="flex items-start gap-2 px-3 py-3 hover:bg-muted/40 transition-colors cursor-pointer group"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("[data-menu]") && !(e.target as HTMLElement).closest("input")) {
            onLoad();
          }
        }}
      >
        <Star className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1">
          {isEditing && onRename ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSubmitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitRename();
                if (e.key === "Escape") {
                  setEditName(saved.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-8 text-sm font-medium"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onRename) {
                  setIsEditing(true);
                  setEditName(saved.name);
                }
              }}
              className="text-left font-medium text-sm truncate block w-full hover:underline"
            >
              {saved.name}
            </button>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {formatFilterSummary(saved)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Created by {saved.createdBy} · {saved.isShared ? "Shared with org" : "Private"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild data-menu>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-70 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onLoad()}>Load</DropdownMenuItem>
            {onRename && (
              <DropdownMenuItem
                onClick={() => {
                  setIsEditing(true);
                  setEditName(saved.name);
                }}
              >
                Rename
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onToggleShared}>
              {saved.isShared ? "Unshare" : "Share with organization"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
