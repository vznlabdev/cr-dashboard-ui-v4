"use client";

import { LayoutList, LayoutGrid, Rows } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { SearchEntityType, SearchDisplayMode } from "@/types/search";
import { cn } from "@/lib/utils";

/** Single sort option: value is sortBy + "_" + sortOrder for Select. */
interface SortOption {
  value: string;
  label: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const BASE_SORT_OPTIONS: SortOption[] = [
  { value: "relevance_desc", label: "Relevance", sortBy: "relevance", sortOrder: "desc" },
  { value: "date_desc", label: "Newest first", sortBy: "date", sortOrder: "desc" },
  { value: "date_asc", label: "Oldest first", sortBy: "date", sortOrder: "asc" },
  { value: "name_asc", label: "Name A→Z", sortBy: "name", sortOrder: "asc" },
  { value: "name_desc", label: "Name Z→A", sortBy: "name", sortOrder: "desc" },
];

const ENTITY_SORT_OPTIONS: Record<string, SortOption[]> = {
  asset: [
    { value: "fileSize_desc", label: "File size", sortBy: "fileSize", sortOrder: "desc" },
    { value: "fileSize_asc", label: "File size (small first)", sortBy: "fileSize", sortOrder: "asc" },
    { value: "aclarScore_desc", label: "ACLAR score (high first)", sortBy: "aclarScore", sortOrder: "desc" },
    { value: "aclarScore_asc", label: "ACLAR score (low first)", sortBy: "aclarScore", sortOrder: "asc" },
  ],
  task: [
    { value: "priority_desc", label: "Priority", sortBy: "priority", sortOrder: "desc" },
    { value: "dueDate_asc", label: "Due date", sortBy: "dueDate", sortOrder: "asc" },
    { value: "dueDate_desc", label: "Due date (latest first)", sortBy: "dueDate", sortOrder: "desc" },
  ],
  compliance: [
    { value: "severity_desc", label: "Severity", sortBy: "severity", sortOrder: "desc" },
    { value: "severity_asc", label: "Severity (low first)", sortBy: "severity", sortOrder: "asc" },
  ],
  contract: [
    { value: "contractValue_desc", label: "Value (high first)", sortBy: "contractValue", sortOrder: "desc" },
    { value: "contractValue_asc", label: "Value (low first)", sortBy: "contractValue", sortOrder: "asc" },
    { value: "expiration_asc", label: "Expiration", sortBy: "expiration", sortOrder: "asc" },
    { value: "expiration_desc", label: "Expiration (latest first)", sortBy: "expiration", sortOrder: "desc" },
  ],
};

function getSortOptions(
  entityType: SearchEntityType | "all",
  showRelevance: boolean
): SortOption[] {
  const base = showRelevance
    ? BASE_SORT_OPTIONS
    : BASE_SORT_OPTIONS.filter((o) => o.sortBy !== "relevance");
  if (entityType === "all") return base;
  const entityOpts = ENTITY_SORT_OPTIONS[entityType] ?? [];
  return [...base, ...entityOpts];
}

function toSelectValue(sortBy: string, sortOrder: string): string {
  return `${sortBy}_${sortOrder}`;
}

export interface DisplayControlsProps {
  totalResults: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  displayMode: SearchDisplayMode;
  onSortChange: (sortBy: string, order: "asc" | "desc") => void;
  onDisplayModeChange: (mode: SearchDisplayMode) => void;
  entityType: SearchEntityType | "all";
  /** When true, show "Relevance" in sort options (e.g. when user has entered search text). */
  showRelevance?: boolean;
}

export function DisplayControls({
  totalResults,
  sortBy,
  sortOrder,
  displayMode,
  onSortChange,
  onDisplayModeChange,
  entityType,
  showRelevance = true,
}: DisplayControlsProps) {
  const options = getSortOptions(entityType, showRelevance);
  const currentValue = toSelectValue(sortBy, sortOrder);
  const resolvedValue = options.some((o) => toSelectValue(o.sortBy, o.sortOrder) === currentValue)
    ? currentValue
    : options[0] ? toSelectValue(options[0].sortBy, options[0].sortOrder) : "";

  const showGrid = entityType === "asset" || entityType === "brand";

  return (
    <div className="mb-3 flex flex-nowrap items-center justify-between gap-3 min-w-0">
      {/* Left: count · Sorted by [dropdown] */}
      <div className="flex flex-nowrap items-center gap-2 min-w-0 shrink">
        <span className="text-sm text-gray-500 dark:text-muted-foreground whitespace-nowrap">
          {totalResults} result{totalResults !== 1 ? "s" : ""}
        </span>
        <span className="text-sm text-gray-500 dark:text-muted-foreground">·</span>
        <div className="flex flex-nowrap items-center gap-2 min-w-0">
          <span className="text-sm text-gray-500 dark:text-muted-foreground whitespace-nowrap">
            Sorted by:
          </span>
          <Select
            value={resolvedValue}
            onValueChange={(value) => {
              const opt = options.find((o) => toSelectValue(o.sortBy, o.sortOrder) === value);
              if (opt) onSortChange(opt.sortBy, opt.sortOrder);
            }}
          >
            <SelectTrigger className="h-8 w-[140px] shrink-0 border-gray-200 dark:border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: display mode [List] [Grid] [Compact] */}
      <div className="flex shrink-0 gap-0.5 rounded-md border border-border p-0.5 bg-gray-100/80 dark:bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-8 rounded",
            displayMode === "list"
              ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              : "bg-gray-200 dark:bg-muted text-gray-500 dark:text-muted-foreground hover:bg-gray-300 dark:hover:bg-muted"
          )}
          onClick={() => onDisplayModeChange("list")}
          title="List view"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
        {showGrid ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-8 rounded",
              displayMode === "grid"
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                : "bg-gray-200 dark:bg-muted text-gray-500 dark:text-muted-foreground hover:bg-gray-300 dark:hover:bg-muted"
            )}
            onClick={() => onDisplayModeChange("grid")}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-8 rounded",
            displayMode === "compact"
              ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
              : "bg-gray-200 dark:bg-muted text-gray-500 dark:text-muted-foreground hover:bg-gray-300 dark:hover:bg-muted"
          )}
          onClick={() => onDisplayModeChange("compact")}
          title="Compact view"
        >
          <Rows className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
