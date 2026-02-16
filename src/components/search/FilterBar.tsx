"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SearchFilter, FilterDefinition, SearchEntityType } from "@/types/search";
import { FilterDropdown } from "./FilterDropdown";

/** Pill color by field category for visual grouping */
function getPillColorClass(field: string): string {
  if (field.includes("status") || field.includes("Status")) return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  if (field.includes("brand") || field.includes("Brand") || field.includes("brand")) return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
  if (field.includes("Date") || field.includes("date")) return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  if (field.includes("Type") || field.includes("Method") || field.includes("Category")) return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  if (field.includes("Score") || field.includes("Range") || field.includes("Count")) return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  if (field.includes("Assignee") || field.includes("Priority") || field.includes("Severity")) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
  return "bg-muted text-muted-foreground border-border";
}

function getFieldLabel(field: string, definitions: FilterDefinition[]): string {
  const def = definitions.find((d) => d.field === field);
  return def?.label ?? field;
}

function formatPillLabel(f: SearchFilter, definitions: FilterDefinition[]): string {
  const fieldLabel = getFieldLabel(f.field, definitions);
  const value = f.value;
  if (Array.isArray(value) && value.length > 1) {
    return `${fieldLabel}: ${value.length} selected`;
  }
  return `${fieldLabel}: ${f.label}`;
}

export interface FilterBarProps {
  activeFilters: SearchFilter[];
  entityType: SearchEntityType | "all";
  availableFilters: FilterDefinition[];
  onAddFilter: (filter: SearchFilter) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export function FilterBar({
  activeFilters,
  entityType,
  availableFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
  disabled = false,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);

  const handleApply = useCallback(
    (filter: SearchFilter) => {
      onAddFilter(filter);
      setOpen(false);
    },
    [onAddFilter]
  );

  const handleClose = useCallback(() => setOpen(false), []);

  const hasFilters = activeFilters.length > 0;
  const showScrollFade = activeFilters.length > 6;

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="relative flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="h-8 shrink-0"
            >
              + Add Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-3">
            <FilterDropdown
              availableFilters={availableFilters}
              onApply={handleApply}
              onClose={handleClose}
            />
          </PopoverContent>
        </Popover>

        <div
          className={cn(
            "flex flex-1 items-center gap-2 overflow-x-auto scrollbar-thin py-0.5 min-w-0",
            showScrollFade &&
              "[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]"
          )}
        >
          {activeFilters.map((f) => (
            <span
              key={f.id}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 animate-in fade-in slide-in-from-left-2",
                getPillColorClass(f.field)
              )}
            >
              <span>{formatPillLabel(f, availableFilters)}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter(f.id)}
                className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                aria-label={`Remove ${f.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
