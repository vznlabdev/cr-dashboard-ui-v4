"use client";

import type {
  SearchResult,
  SearchEntityType,
  SearchDisplayMode,
} from "@/types/search";
import { SearchResultItem } from "./SearchResultItem";
import { SearchResultGroup } from "./SearchResultGroup";

const GROUP_ORDER: SearchEntityType[] = [
  "asset",
  "project",
  "task",
  "workflow",
  "brand",
  "talent",
  "compliance",
  "contract",
  "insurance",
  "team_member",
];

export interface ResultsListProps {
  results: SearchResult[];
  resultsByType: Record<SearchEntityType, number>;
  entityType: SearchEntityType | "all";
  displayMode: SearchDisplayMode;
  selectedIndex: number;
  onSelectResult: (result: SearchResult) => void;
  onSwitchTab: (type: SearchEntityType) => void;
  isLoading?: boolean;
}

export function ResultsList({
  results,
  resultsByType,
  entityType,
  displayMode,
  selectedIndex,
  onSelectResult,
  onSwitchTab,
  isLoading = false,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Loading results…
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        No results found.
      </div>
    );
  }

  if (entityType === "all") {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {GROUP_ORDER.map((type) => {
          const typeResults = results.filter((r) => r.entityType === type);
          const totalCount = resultsByType[type] ?? 0;
          if (totalCount === 0) return null;
          const displayItems = typeResults.slice(0, 3).map((r) => ({
            result: r,
            globalIndex: results.findIndex((x) => x.id === r.id),
          }));

          return (
            <SearchResultGroup
              key={type}
              entityType={type}
              items={displayItems}
              totalCount={totalCount}
              displayMode={displayMode}
              onShowAll={() => onSwitchTab(type)}
              selectedIndex={selectedIndex}
              onSelectResult={onSelectResult}
            />
          );
        })}
      </div>
    );
  }

  if (displayMode === "grid") {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {results.map((r, i) => (
            <SearchResultItem
              key={r.id}
              result={r}
              isSelected={selectedIndex === i}
              displayMode="grid"
              onClick={() => onSelectResult(r)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="divide-y divide-border">
        {results.map((r, i) => (
          <SearchResultItem
            key={r.id}
            result={r}
            isSelected={selectedIndex === i}
            displayMode={displayMode}
            onClick={() => onSelectResult(r)}
          />
        ))}
      </div>
    </div>
  );
}
