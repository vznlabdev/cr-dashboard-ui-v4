"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterOption {
  label: string
  value: string
}

interface ContextFilterBarProps {
  projects?: FilterOption[]
  jurisdictions?: FilterOption[]
  riskClasses?: FilterOption[]
  onFiltersChange?: (filters: Record<string, string>) => void
}

export function ContextFilterBar({ projects, jurisdictions, riskClasses, onFiltersChange }: ContextFilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const allProjects: FilterOption[] = projects || [
    { label: "Nike Summer Campaign", value: "proj-1" },
    { label: "Samsung Product Launch", value: "proj-2" },
    { label: "Toyota Brand Refresh", value: "proj-3" },
  ]

  const workflowTypes: FilterOption[] = [
    { label: "AI Generated", value: "AI" },
    { label: "Human Created", value: "HUMAN" },
    { label: "Hybrid", value: "HYBRID" },
  ]

  const allRiskClasses: FilterOption[] = riskClasses || [
    { label: "Low", value: "Low" },
    { label: "Moderate", value: "Moderate" },
    { label: "Guarded", value: "Guarded" },
    { label: "Elevated", value: "Elevated" },
    { label: "Severe", value: "Severe" },
    { label: "Critical", value: "Critical" },
  ]

  const hasFilters = Object.keys(activeFilters).length > 0

  function setFilter(key: string, value: string) {
    const next = { ...activeFilters }
    if (next[key] === value) {
      delete next[key]
    } else {
      next[key] = value
    }
    setActiveFilters(next)
    onFiltersChange?.(next)
  }

  function clearAll() {
    setActiveFilters({})
    onFiltersChange?.({})
  }

  return (
    <div className="flex items-center gap-2 w-full overflow-x-auto py-1.5 px-0.5 min-h-[36px]">
      {/* Project */}
      <FilterDropdown
        label="Project"
        options={allProjects}
        activeValue={activeFilters.project}
        onChange={(v) => setFilter("project", v)}
      />
      {/* Workflow Type */}
      <FilterDropdown
        label="Workflow"
        options={workflowTypes}
        activeValue={activeFilters.workflow}
        onChange={(v) => setFilter("workflow", v)}
      />
      {/* Risk Class */}
      <FilterDropdown
        label="Risk"
        options={allRiskClasses}
        activeValue={activeFilters.risk}
        onChange={(v) => setFilter("risk", v)}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-muted-foreground" onClick={clearAll}>
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}

function FilterDropdown({
  label,
  options,
  activeValue,
  onChange,
}: {
  label: string
  options: FilterOption[]
  activeValue?: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const activeLabel = options.find((o) => o.value === activeValue)?.label

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors",
          activeValue
            ? "border-foreground/20 bg-foreground/5 text-foreground font-medium"
            : "border-border/60 text-muted-foreground hover:bg-muted/50"
        )}
      >
        {activeLabel || label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 w-44 rounded-md border border-border/60 bg-background shadow-sm py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-[12px] hover:bg-muted/50 transition-colors",
                  activeValue === opt.value && "bg-muted font-medium"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
