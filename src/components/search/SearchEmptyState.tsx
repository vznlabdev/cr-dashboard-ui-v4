"use client";

import { Search, Clock, FileImage, FolderKanban, CheckSquare, GitBranch, Palette, User, ShieldAlert, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedSearch, SearchEntityType } from "@/types/search";
import { SavedSearches } from "./SavedSearches";

const BROWSE_TYPES: { id: SearchEntityType; label: string; Icon: typeof FileImage }[] = [
  { id: "asset", label: "Assets", Icon: FileImage },
  { id: "project", label: "Projects", Icon: FolderKanban },
  { id: "task", label: "Tasks", Icon: CheckSquare },
  { id: "workflow", label: "Workflows", Icon: GitBranch },
  { id: "brand", label: "Brands", Icon: Palette },
  { id: "talent", label: "Talent", Icon: User },
  { id: "compliance", label: "Compliance", Icon: ShieldAlert },
  { id: "contract", label: "Contracts", Icon: FileText },
];

export type SearchEmptyStateType = "landing" | "no_results" | "no_results_with_filters";

export interface SearchEmptyStateProps {
  type: SearchEmptyStateType;
  query?: string;
  recentSearches: string[];
  savedSearches: SavedSearch[];
  onSelectRecent: (query: string) => void;
  onLoadSaved: (search: SavedSearch) => void;
  onClearFilters?: () => void;
  onClearRecent?: () => void;
  /** For SavedSearches: delete, toggle shared, rename */
  onDeleteSaved?: (id: string) => void;
  onToggleSharedSaved?: (id: string) => void;
  onRenameSaved?: (id: string, name: string) => void;
  /** Browse by type: switch to entity tab */
  onSelectEntityType?: (type: SearchEntityType) => void;
  /** No results with filters: show "N filters active" and "Search all types" when on a specific tab */
  filterCount?: number;
  entityType?: SearchEntityType | "all";
  onSwitchToAll?: () => void;
}

export function SearchEmptyState({
  type,
  query = "",
  recentSearches,
  savedSearches,
  onSelectRecent,
  onLoadSaved,
  onClearFilters,
  onClearRecent,
  onDeleteSaved,
  onToggleSharedSaved,
  onRenameSaved,
  onSelectEntityType,
  filterCount = 0,
  entityType = "all",
  onSwitchToAll,
}: SearchEmptyStateProps) {
  if (type === "landing") {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 md:p-10">
        <div className="text-center mb-8">
          <p className="text-lg font-medium text-foreground">
            Search across your entire workspace
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find assets, projects, tasks, and more
          </p>
        </div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Recent Searches
            </h3>
            {onClearRecent && recentSearches.length > 0 && (
              <button
                type="button"
                onClick={onClearRecent}
                className="text-xs text-muted-foreground hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {recentSearches.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">No recent searches yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentSearches.slice(0, 8).map((q, i) => (
                  <li key={`${q}-${i}`}>
                    <button
                      type="button"
                      onClick={() => onSelectRecent(q)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/60 transition-colors"
                    >
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mb-6">
          {onDeleteSaved && onToggleSharedSaved ? (
            <SavedSearches
              savedSearches={savedSearches}
              onLoad={onLoadSaved}
              onDelete={onDeleteSaved}
              onToggleShared={onToggleSharedSaved}
              onRename={onRenameSaved}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <h3 className="text-sm font-semibold text-muted-foreground px-3 pt-3 pb-2">
                Saved Searches
              </h3>
              {savedSearches.length === 0 ? (
                <p className="px-3 pb-4 text-sm text-muted-foreground">No saved searches.</p>
              ) : (
                <ul className="divide-y divide-border pb-2">
                  {savedSearches.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onLoadSaved(s)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-primary hover:bg-muted/60 hover:underline"
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {onSelectEntityType && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Browse by Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BROWSE_TYPES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectEntityType(id)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-4 hover:bg-muted/50 hover:border-primary/30 transition-colors"
                >
                  <Icon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Keyboard shortcuts: ↑↓ Navigate · Enter Select · ⌘K Quick search
        </p>
      </div>
    );
  }

  if (type === "no_results_with_filters") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Search className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-medium text-foreground">
          No results for &quot;{query}&quot;
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try different keywords or remove some filters.
        </p>
        {filterCount > 0 && (
          <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            {filterCount} filter{filterCount !== 1 ? "s" : ""} active
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {onClearFilters && (
            <Button onClick={onClearFilters} size="sm">
              Clear all filters
            </Button>
          )}
          {entityType !== "all" && onSwitchToAll && (
            <Button variant="outline" size="sm" onClick={onSwitchToAll}>
              Search all types
            </Button>
          )}
        </div>
        {recentSearches.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border text-left">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent searches</p>
            <ul className="space-y-1">
              {recentSearches.slice(0, 4).map((q, i) => (
                <li key={`${q}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onSelectRecent(q)}
                    className="text-sm text-primary hover:underline"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // no_results
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <Search className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-4 font-medium text-foreground">
        No results for &quot;{query}&quot;
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try different keywords or remove some filters.
      </p>
      {onClearFilters && filterCount > 0 && (
        <Button className="mt-4" variant="outline" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
      {recentSearches.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border text-left">
          <p className="text-xs font-medium text-muted-foreground mb-2">Recent searches</p>
          <ul className="space-y-1">
            {recentSearches.slice(0, 4).map((q, i) => (
              <li key={`${q}-${i}`}>
                <button
                  type="button"
                  onClick={() => onSelectRecent(q)}
                  className="text-sm text-primary hover:underline"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
