"use client";

import { useCallback, useEffect, useRef, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import type { SearchEntityType, SearchQuery, SearchFilter } from "@/types/search";
import { SEARCH_FILTER_DEFINITIONS } from "@/lib/data/search-filters";
import { SearchInput } from "@/components/search/SearchInput";
import { EntityTabs } from "@/components/search/EntityTabs";
import { FilterBar } from "@/components/search/FilterBar";
import { DisplayControls } from "@/components/search/DisplayControls";
import { ResultsList } from "@/components/search/ResultsList";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SaveSearchDialog } from "@/components/search/SaveSearchDialog";

const RESERVED_PARAMS = new Set(["q", "type", "sort", "page"]);
const ENTITY_TYPES: (SearchEntityType | "all")[] = [
  "all", "asset", "project", "task", "workflow", "brand", "talent",
  "team_member", "compliance", "contract", "insurance",
];

function parseSearchParamsToQuery(searchParams: URLSearchParams): SearchQuery {
  const q = searchParams.get("q")?.trim() ?? "";
  const typeParam = searchParams.get("type") ?? "all";
  const entityType = ENTITY_TYPES.includes(typeParam as SearchEntityType | "all")
    ? (typeParam as SearchEntityType | "all")
    : "all";
  const sortParam = searchParams.get("sort") ?? "relevance_desc";
  const legacySort: Record<string, { sortBy: string; sortOrder: "asc" | "desc" }> = {
    newest: { sortBy: "date", sortOrder: "desc" },
    oldest: { sortBy: "date", sortOrder: "asc" },
    relevance_desc: { sortBy: "relevance", sortOrder: "desc" },
    name_asc: { sortBy: "name", sortOrder: "asc" },
    name_desc: { sortBy: "name", sortOrder: "desc" },
  };
  const legacy = legacySort[sortParam];
  const sortBy = legacy ? legacy.sortBy : (sortParam.includes("_") ? sortParam.split("_")[0] : sortParam) ?? "relevance";
  const sortOrder: "asc" | "desc" = legacy ? legacy.sortOrder : (sortParam.includes("_") ? (sortParam.split("_")[1] === "asc" ? "asc" : "desc") : "desc");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const filters: SearchFilter[] = [];
  const defByField = new Map(SEARCH_FILTER_DEFINITIONS.map((d) => [d.field, d]));
  searchParams.forEach((value, key) => {
    if (RESERVED_PARAMS.has(key) || !value) return;
    const def = defByField.get(key);
    if (!def) return;
    const label = def.options?.find((o) => o.value === value)?.label ?? value;
    filters.push({
      id: `${key}-${value}`,
      field: key,
      operator: "is",
      value,
      label,
    });
  });

  return {
    text: q,
    entityType,
    filters,
    sortBy,
    sortOrder,
    page,
    pageSize: 25,
  };
}

function queryToSearchString(query: SearchQuery): string {
  const params = new URLSearchParams();
  if (query.text) params.set("q", query.text);
  if (query.entityType !== "all") params.set("type", query.entityType);
  const sortVal = `${query.sortBy}_${query.sortOrder}`;
  if (sortVal !== "relevance_desc") params.set("sort", sortVal);
  if (query.page > 1) params.set("page", String(query.page));
  query.filters.forEach((f) => {
    if (f.operator === "is" && typeof f.value === "string") params.set(f.field, f.value);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    query,
    results,
    totalResults,
    resultsByType,
    isLoading,
    displayOptions,
    recentSearches,
    savedSearches,
    selectedIndex,
    search,
    setQueryText,
    setPage,
    setEntityType,
    setSortBy,
    setDisplayMode,
    setQueryFromUrl,
    removeFilter,
    clearFilters,
    addFilter,
    getAvailableFilters,
    saveSearch,
    loadSearch,
    deleteSearch,
    updateSavedSearch,
    clearRecentSearches,
    setSelectedIndex,
    moveSelection,
    confirmSelection,
    runSearch,
  } = useSearch();

  // Sync URL -> state (browser back/forward, shared links)
  useEffect(() => {
    const next = parseSearchParamsToQuery(searchParams);
    setQueryFromUrl(next);
  }, [searchParams, setQueryFromUrl]);

  // Sync state -> URL (shareable, bookmarkable)
  const prevQueryRef = useRef<string>("");
  useEffect(() => {
    const key = JSON.stringify({
      text: query.text,
      entityType: query.entityType,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      filters: query.filters.map((f) => `${f.field}:${f.value}`).sort(),
    });
    if (key === prevQueryRef.current) return;
    prevQueryRef.current = key;
    const desired = queryToSearchString(query);
    const current = typeof window !== "undefined" ? window.location.search : "";
    const currentNorm = current.startsWith("?") ? current : current ? `?${current}` : "";
    if (desired !== currentNorm) {
      router.replace(`/search${desired}`, { scroll: false });
    }
  }, [query, router]);

  const hasQuery = query.text.trim().length > 0;
  const hasFilters = query.filters.length > 0;
  const hasResults = results.length > 0;
  const showEmptyNoQuery = !hasQuery && !hasResults && !isLoading;
  const showEmptyNoResults = hasQuery && !hasResults && !isLoading;
  const showEmptyNoResultsWithFilters = hasQuery && hasFilters && !hasResults && !isLoading;

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const canSaveSearch = hasQuery || hasFilters;

  const handleSaveSearch = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  const handleSaveSearchConfirm = useCallback(
    (name: string, isShared: boolean) => {
      saveSearch(name, isShared);
    },
    [saveSearch]
  );

  const handleShowAllOfType = useCallback(
    (type: SearchEntityType) => {
      setEntityType(type);
    },
    [setEntityType]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection("up");
      } else if (e.key === "Enter" && !e.repeat && (e.target as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault();
        confirmSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveSelection, confirmSelection]);

  const totalPages = Math.max(1, Math.ceil(totalResults / query.pageSize));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Top bar: Back + Save Search */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSearch}
            disabled={!canSaveSearch}
          >
            Save Search
          </Button>
        </div>

        <SaveSearchDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          currentQuery={query}
          onSave={handleSaveSearchConfirm}
        />

        {/* Search input */}
        <div className="mb-6">
          <SearchInput
            value={query.text}
            onChange={search}
            onClear={() => {
              setQueryText("");
              runSearch();
            }}
            placeholder="Search projects, assets, tasks, workflows..."
            autoFocus
            recentSearches={recentSearches}
            onSelectRecent={(q) => setQueryText(q)}
            onClearRecent={clearRecentSearches}
            disabled={isLoading}
          />
        </div>

        {/* Entity tabs */}
        <div className="mb-4">
          <EntityTabs
            activeType={query.entityType}
            counts={resultsByType}
            onChange={setEntityType}
          />
        </div>

        {/* Filter bar */}
        <div className="mb-4">
          <FilterBar
            activeFilters={query.filters}
            entityType={query.entityType}
            availableFilters={getAvailableFilters(query.entityType)}
            onAddFilter={addFilter}
            onRemoveFilter={removeFilter}
            onClearAll={clearFilters}
            disabled={isLoading}
          />
        </div>

        {/* Results header: count, sort, display mode */}
        <DisplayControls
          totalResults={totalResults}
          sortBy={query.sortBy}
          sortOrder={query.sortOrder}
          displayMode={displayOptions.mode}
          onSortChange={setSortBy}
          onDisplayModeChange={setDisplayMode}
          entityType={query.entityType}
          showRelevance={hasQuery}
        />

        {/* Results list or empty state */}
        {showEmptyNoQuery && (
          <SearchEmptyState
            type="landing"
            recentSearches={recentSearches}
            savedSearches={savedSearches}
            onSelectRecent={(text) => setQueryText(text)}
            onLoadSaved={(saved) => loadSearch(saved.id)}
            onDeleteSaved={deleteSearch}
            onToggleSharedSaved={(id) => {
              const s = savedSearches.find((x) => x.id === id);
              if (s) updateSavedSearch(id, { isShared: !s.isShared });
            }}
            onRenameSaved={(id, name) => updateSavedSearch(id, { name })}
            onSelectEntityType={setEntityType}
            onClearRecent={clearRecentSearches}
          />
        )}

        {showEmptyNoResults && !showEmptyNoQuery && !showEmptyNoResultsWithFilters && (
          <SearchEmptyState
            type="no_results"
            query={query.text}
            recentSearches={recentSearches}
            savedSearches={savedSearches}
            onSelectRecent={(text) => setQueryText(text)}
            onLoadSaved={(saved) => loadSearch(saved.id)}
            onClearFilters={hasFilters ? clearFilters : undefined}
            filterCount={query.filters.length}
          />
        )}

        {showEmptyNoResultsWithFilters && (
          <SearchEmptyState
            type="no_results_with_filters"
            query={query.text}
            recentSearches={recentSearches}
            savedSearches={savedSearches}
            onSelectRecent={(text) => setQueryText(text)}
            onLoadSaved={(saved) => loadSearch(saved.id)}
            onClearFilters={clearFilters}
            filterCount={query.filters.length}
            entityType={query.entityType}
            onSwitchToAll={() => setEntityType("all")}
          />
        )}

        {hasResults && (
          <ResultsList
            results={results}
            resultsByType={resultsByType}
            entityType={query.entityType}
            displayMode={displayOptions.mode}
            selectedIndex={selectedIndex}
            onSelectResult={(result) => {
              const i = results.findIndex((r) => r.id === result.id);
              setSelectedIndex(i >= 0 ? i : 0);
            }}
            onSwitchTab={handleShowAllOfType}
            isLoading={isLoading}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={query.page <= 1}
              onClick={() => setPage(query.page - 1)}
            >
              ←
            </Button>
            <span className="text-sm text-muted-foreground">
              {query.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={query.page >= totalPages}
              onClick={() => setPage(query.page + 1)}
            >
              →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
