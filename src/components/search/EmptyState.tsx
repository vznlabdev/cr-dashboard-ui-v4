"use client";

import type { SavedSearch } from "@/types/search";
import { SavedSearches } from "./SavedSearches";

export type EmptyStateVariant = "no_query" | "no_results" | "no_results_with_filters";

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  queryText?: string;
  recentSearches: string[];
  savedSearches: SavedSearch[];
  onRecentSelect: (text: string) => void;
  onSavedSelect: (id: string) => void;
  onClearRecent?: () => void;
  onSavedLoad?: (search: SavedSearch) => void;
  onSavedDelete?: (id: string) => void;
  onSavedToggleShared?: (id: string) => void;
  onSavedRename?: (id: string, name: string) => void;
}

export function EmptyState({
  variant,
  queryText = "",
  recentSearches,
  savedSearches,
  onRecentSelect,
  onSavedSelect,
  onClearRecent,
  onSavedLoad,
  onSavedDelete,
  onSavedToggleShared,
  onSavedRename,
}: EmptyStateProps) {
  if (variant === "no_query") {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8">
        <h3 className="text-sm font-semibold text-muted-foreground">Recent Searches</h3>
        {recentSearches.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No recent searches yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {recentSearches.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => onRecentSelect(s)}
                  className="text-sm text-primary hover:underline"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
        {onClearRecent && recentSearches.length > 0 && (
          <button
            type="button"
            onClick={onClearRecent}
            className="mt-2 text-xs text-muted-foreground hover:underline"
          >
            Clear recent
          </button>
        )}

        {onSavedLoad && onSavedDelete && onSavedToggleShared ? (
          <SavedSearches
            savedSearches={savedSearches}
            onLoad={onSavedLoad}
            onDelete={onSavedDelete}
            onToggleShared={onSavedToggleShared}
            onRename={onSavedRename}
          />
        ) : (
          <>
            <h3 className="mt-6 text-sm font-semibold text-muted-foreground">Saved Searches</h3>
            {savedSearches.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No saved searches.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {savedSearches.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSavedSelect(s.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    );
  }

  if (variant === "no_results_with_filters") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No results matching filters. Try removing some.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <p className="text-muted-foreground">
        No results for &quot;{queryText}&quot;. Try a different search.
      </p>
    </div>
  );
}
