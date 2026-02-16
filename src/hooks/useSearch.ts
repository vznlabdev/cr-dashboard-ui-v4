"use client";

/**
 * Comprehensive React hook for Creation Rights enterprise search.
 * Manages state, debounced search, filters, sort, display, saved/recent searches,
 * and keyboard selection. Uses mock data; designed to swap to API later.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  SearchQuery,
  SearchResult,
  SearchFilter,
  SearchEntityType,
  SearchDisplayMode,
  SearchDisplayOptions,
  SavedSearch,
  FilterOperator,
} from "@/types/search";
import {
  MOCK_SEARCH_INDEX,
  searchMockIndex,
  MOCK_SAVED_SEARCHES,
} from "@/lib/data/search-mock-data";
import { getFiltersForEntityType } from "@/lib/data/search-filters";

const RECENT_STORAGE_KEY = "cr-search-recent";
const MAX_RECENT = 10;
const DEBOUNCE_MS = 300;
const LOADING_DELAY_MS = 200;

const ENTITY_TYPES: SearchEntityType[] = [
  "asset",
  "project",
  "task",
  "workflow",
  "brand",
  "talent",
  "team_member",
  "compliance",
  "contract",
  "insurance",
];

function emptyResultsByType(): Record<SearchEntityType, number> {
  return ENTITY_TYPES.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<SearchEntityType, number>);
}

/** Normalize status-like value for filter comparison (lowercase, spaces → underscores). */
function normalizeStatus(s: string | undefined): string {
  if (s == null || s === "") return "";
  return s.toLowerCase().replace(/\s+/g, "_").trim();
}

/** Get a value from a result for a given filter field (for mock filtering). */
function getResultValue(r: SearchResult, field: string): string | number | undefined {
  const m = r.metadata;
  switch (field) {
    case "status":
      return normalizeStatus(m.status);
    case "createdDate":
      return r.createdAt;
    case "updatedDate":
      return r.updatedAt;
    case "brand":
      return (m.brand ?? r.subtitle ?? "").toString().toLowerCase();
    case "fileType":
      return (m.fileType ?? "").toString().toLowerCase();
    case "creationMethod":
      return (m.creationMethod ?? "").toString();
    case "aclarScore":
      return m.aclarScore;
    case "approvalStatus":
      return normalizeStatus(m.status);
    case "projectStatus":
      return normalizeStatus(m.status);
    case "assignee":
      return (m.assignee ?? "").toString().toLowerCase().replace(/\s+/g, "-");
    case "priority":
      return (m.priority ?? "").toString();
    case "taskStatus":
      return normalizeStatus(m.status);
    case "severity":
      return (m.severity ?? "").toString();
    case "riskLevel":
      return (m.riskLevel ?? "").toString();
    case "contractValue":
      return m.contractValue;
    case "assetCount":
      return m.assetCount;
    case "expirationDate":
    case "expiration":
      return (m.expirationDate ?? "").toString();
    case "policyNumber":
      return (m.policyNumber ?? "").toString();
    default:
      return (m as Record<string, unknown>)[field] as string | number | undefined;
  }
}

/** Apply a single filter to a result; returns true if result passes. */
function resultMatchesFilter(r: SearchResult, f: SearchFilter): boolean {
  const raw = getResultValue(r, f.field);
  const val = f.value;
  const op = f.operator;

  const str = (v: unknown) => (v == null ? "" : String(v).toLowerCase());
  const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
  const date = (v: unknown) => (v ? new Date(String(v)).getTime() : 0);

  if (op === "is") {
    if (Array.isArray(val)) return Array.isArray(raw) ? false : val.some((v) => str(raw) === str(v));
    if (typeof val === "boolean") return raw === val;
    return str(raw) === str(val);
  }
  if (op === "is_not") {
    if (Array.isArray(val)) return !val.some((v) => str(raw) === str(v));
    return str(raw) !== str(val);
  }
  if (op === "contains") return str(raw).includes(str(val));
  if (op === "before") return date(raw) < date(val);
  if (op === "after") return date(raw) > date(val);
  if (op === "between") {
    const [a, b] = Array.isArray(val) ? val : [val, val];
    const t = date(raw);
    return t >= date(a) && t <= date(b);
  }
  if (op === "gt") return num(raw) > num(val);
  if (op === "lt") return num(raw) < num(val);
  return true;
}

/** Apply all filters to a list of results. */
function applyFilters(results: SearchResult[], filters: SearchFilter[]): SearchResult[] {
  if (filters.length === 0) return results;
  return results.filter((r) => filters.every((f) => resultMatchesFilter(r, f)));
}

/** Sort results by sortBy and sortOrder. */
function sortResults(
  results: SearchResult[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): SearchResult[] {
  const dir = sortOrder === "asc" ? 1 : -1;
  const sorted = [...results].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "relevance":
        cmp = (a.score ?? 0) - (b.score ?? 0);
        break;
      case "date":
      case "createdAt":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "dueDate":
        cmp =
          new Date((a.metadata.dueDate as string) || 0).getTime() -
          new Date((b.metadata.dueDate as string) || 0).getTime();
        break;
      case "name":
      case "title":
        cmp = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        break;
      case "status":
        cmp = (a.metadata.status ?? "").localeCompare(b.metadata.status ?? "", undefined, {
          sensitivity: "base",
        });
        break;
      default:
        cmp = 0;
    }
    return dir * cmp;
  });
  return sorted;
}

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

const defaultQuery: SearchQuery = {
  text: "",
  entityType: "all",
  filters: [],
  sortBy: "relevance",
  sortOrder: "desc",
  page: 1,
  pageSize: 25,
};

const defaultDisplayOptions: SearchDisplayOptions = {
  mode: "list",
  showThumbnails: true,
  showMetadata: true,
  groupByType: true,
};

export interface UseSearchReturn {
  // State
  query: SearchQuery;
  results: SearchResult[];
  totalResults: number;
  resultsByType: Record<SearchEntityType, number>;
  isLoading: boolean;
  displayOptions: SearchDisplayOptions;
  recentSearches: string[];
  savedSearches: SavedSearch[];
  selectedIndex: number;

  // Search
  search: (text: string) => void;
  runSearch: () => void;

  // Filters
  addFilter: (filter: SearchFilter) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  getAvailableFilters: (entityType: SearchEntityType | "all") => ReturnType<typeof getFiltersForEntityType>;

  // Sort / display
  setSortBy: (field: string, order: "asc" | "desc") => void;
  setDisplayMode: (mode: SearchDisplayMode) => void;
  setEntityType: (type: SearchEntityType | "all") => void;
  setQueryText: (text: string) => void;
  setPage: (page: number) => void;
  /** Replace entire query (e.g. from URL or loadSearch). */
  setQueryFromUrl: (q: SearchQuery) => void;

  // Saved searches
  saveSearch: (name: string, isShared?: boolean) => void;
  loadSearch: (id: string) => void;
  deleteSearch: (id: string) => void;
  updateSavedSearch: (id: string, updates: { name?: string; isShared?: boolean }) => void;

  // Recent
  clearRecentSearches: () => void;

  // Keyboard
  moveSelection: (direction: "up" | "down") => void;
  confirmSelection: () => void;
  setSelectedIndex: (index: number) => void;
}

export function useSearch(): UseSearchReturn {
  const router = useRouter();
  const [query, setQuery] = useState<SearchQuery>(defaultQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsByType, setResultsByType] = useState<Record<SearchEntityType, number>>(
    emptyResultsByType
  );
  const [isLoading, setIsLoading] = useState(false);
  const [displayOptions, setDisplayOptionsState] = useState<SearchDisplayOptions>(
    defaultDisplayOptions
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(MOCK_SAVED_SEARCHES);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const runSearch = useCallback(() => {
    setIsLoading(true);
    const delay = setTimeout(() => {
      if (!isMountedRef.current) return;
      // 1) Text + no entity filter → base set (for counts and filtering)
      const textFiltered = searchMockIndex(query.text, "all");
      // 2) Apply filters
      const filtered = applyFilters(textFiltered, query.filters);
      // 3) Count by type BEFORE entity tab filter (tab badges)
      const byType = emptyResultsByType();
      filtered.forEach((r) => {
        byType[r.entityType] = (byType[r.entityType] ?? 0) + 1;
      });
      setResultsByType(byType);
      // 4) Apply entity type for display
      const forDisplay =
        query.entityType === "all"
          ? filtered
          : filtered.filter((r) => r.entityType === query.entityType);
      // 5) Sort
      const sorted = sortResults(forDisplay, query.sortBy, query.sortOrder);
      setTotalResults(sorted.length);
      // 6) Paginate
      const start = (query.page - 1) * query.pageSize;
      setResults(sorted.slice(start, start + query.pageSize));
      setSelectedIndex(0);
      setIsLoading(false);
    }, LOADING_DELAY_MS);
    return () => clearTimeout(delay);
  }, [query.text, query.entityType, query.filters, query.sortBy, query.sortOrder, query.page, query.pageSize]);

  useEffect(() => {
    isMountedRef.current = true;
    setRecentSearches(loadRecentSearches());
    return () => {
      isMountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const search = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        setQuery((q) => ({ ...q, text: text.trim(), page: 1 }));
        if (text.trim()) {
          setRecentSearches((prev) => {
            const next = [text.trim(), ...prev.filter((s) => s !== text.trim())].slice(0, MAX_RECENT);
            saveRecentSearches(next);
            return next;
          });
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  const addFilter = useCallback((filter: SearchFilter) => {
    setQuery((q) => ({
      ...q,
      filters: q.filters.some((f) => f.id === filter.id) ? q.filters : [...q.filters, filter],
      page: 1,
    }));
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setQuery((q) => ({
      ...q,
      filters: q.filters.filter((f) => f.id !== filterId),
      page: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setQuery((q) => ({ ...q, filters: [], page: 1 }));
  }, []);

  const setSortBy = useCallback((field: string, order: "asc" | "desc") => {
    setQuery((q) => ({ ...q, sortBy: field, sortOrder: order, page: 1 }));
  }, []);

  const setDisplayMode = useCallback((mode: SearchDisplayMode) => {
    setDisplayOptionsState((o) => ({ ...o, mode }));
  }, []);

  const setEntityType = useCallback((type: SearchEntityType | "all") => {
    setQuery((q) => ({ ...q, entityType: type, page: 1 }));
  }, []);

  const setQueryText = useCallback((text: string) => {
    setQuery((q) => ({ ...q, text, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((q) => ({ ...q, page: Math.max(1, page) }));
  }, []);

  const saveSearch = useCallback(
    (name: string, isShared = false) => {
      const newSaved: SavedSearch = {
        id: `saved-${Date.now()}`,
        name,
        query: { ...query },
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
        isShared,
      };
      setSavedSearches((prev) => [...prev, newSaved]);
    },
    [query]
  );

  const updateSavedSearch = useCallback(
    (id: string, updates: { name?: string; isShared?: boolean }) => {
      setSavedSearches((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...(updates.name !== undefined && { name: updates.name }), ...(updates.isShared !== undefined && { isShared: updates.isShared }) }
            : s
        )
      );
    },
    []
  );

  const setQueryFromUrl = useCallback((next: SearchQuery) => {
    setQuery(next);
  }, []);

  const loadSearch = useCallback((id: string) => {
    const found = savedSearches.find((s) => s.id === id);
    if (found) {
      setQuery(found.query);
    }
  }, [savedSearches]);

  const deleteSearch = useCallback((id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    saveRecentSearches([]);
  }, []);

  const moveSelection = useCallback((direction: "up" | "down") => {
    setSelectedIndex((i) => {
      const next = direction === "down" ? i + 1 : i - 1;
      const max = Math.max(0, results.length - 1);
      return Math.min(max, Math.max(0, next));
    });
  }, [results.length]);

  const confirmSelection = useCallback(() => {
    const item = results[selectedIndex];
    if (item?.url) router.push(item.url);
  }, [results, selectedIndex, router]);

  return {
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
    runSearch,
    addFilter,
    removeFilter,
    clearFilters,
    getAvailableFilters: getFiltersForEntityType,
    setSortBy,
    setDisplayMode,
    setEntityType,
    setQueryText,
    setPage,
    setQueryFromUrl,
    saveSearch,
    loadSearch,
    deleteSearch,
    updateSavedSearch,
    clearRecentSearches,
    moveSelection,
    confirmSelection,
    setSelectedIndex,
  };
}
