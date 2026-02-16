/**
 * Creation Rights enterprise search type system.
 * Powers full-page search, Cmd+K quick search, filters, and result display.
 */

// --- Core Search Types ---

/** Entity types that can be searched across the platform. */
export type SearchEntityType =
  | "asset"
  | "project"
  | "task"
  | "workflow"
  | "brand"
  | "talent"
  | "team_member"
  | "compliance"
  | "contract"
  | "insurance";

/** A single search result item with display and link data. */
export interface SearchResult {
  id: string;
  entityType: SearchEntityType;
  /** Primary display text (e.g. asset name, project title). */
  title: string;
  /** Secondary line (e.g. brand name, project name). */
  subtitle?: string;
  /** Snippet or preview text. */
  description?: string;
  /** Link to entity detail page. */
  url: string;
  /** Entity-specific icon identifier. */
  icon?: string;
  /** Image URL for assets. */
  thumbnail?: string;
  /** Structured metadata for display in result row. */
  metadata: SearchResultMetadata;
  /** Relevance score from search backend. */
  score?: number;
  /** Matched text highlights for snippet display. */
  highlights?: SearchHighlight[];
  createdAt: string;
  updatedAt: string;
}

/** Structured metadata for search result display; fields vary by entity type. */
export interface SearchResultMetadata {
  /** Status label (e.g. "Approved", "In Review"). */
  status?: string;
  /** Tailwind color class for status badge. */
  statusColor?: string;
  /** Asset: file type (image, video, pdf, etc.). */
  fileType?: string;
  /** Asset: human-readable file size. */
  fileSize?: string;
  /** Asset: how the content was created. */
  creationMethod?: "ai_generated" | "ai_enhanced" | "human_made" | "mixed";
  /** Asset: ACLAR risk score. */
  aclarScore?: number;
  /** Project: brand name. */
  brand?: string;
  /** Project: number of assets. */
  assetCount?: number;
  /** Task: assignee name. */
  assignee?: string;
  /** Task: priority level. */
  priority?: "low" | "medium" | "high" | "urgent";
  /** Task: due date. */
  dueDate?: string;
  /** Compliance: severity. */
  severity?: "low" | "medium" | "high" | "critical";
  /** Contract: monetary value. */
  contractValue?: number;
  /** Contract: expiration. */
  expirationDate?: string;
  /** Insurance: risk level. */
  riskLevel?: "low" | "moderate" | "high" | "critical";
  /** Insurance: policy number. */
  policyNumber?: string;
}

/** A highlighted snippet for a matched field. */
export interface SearchHighlight {
  /** Which field was matched (e.g. "title", "description"). */
  field: string;
  /** Text with <mark> tags around matches. */
  snippet: string;
}

// --- Filter System ---

/** Operators for filter conditions. */
export type FilterOperator =
  | "is"
  | "is_not"
  | "contains"
  | "before"
  | "after"
  | "between"
  | "gt"
  | "lt";

/** A single applied filter in the search query. */
export interface SearchFilter {
  id: string;
  /** Field key (e.g. "status", "brand", "creationMethod"). */
  field: string;
  operator: FilterOperator;
  /** Single value, multi-select array, or range tuple. */
  value: string | string[] | number | [string, string];
  /** Human-readable label for the filter pill. */
  label: string;
}

/** Definition of an available filter (shown in filter UI). */
export interface FilterDefinition {
  field: string;
  label: string;
  type:
    | "select"
    | "multi_select"
    | "date"
    | "date_range"
    | "number_range"
    | "text"
    | "boolean";
  operators: FilterOperator[];
  /** Options for select/multi_select. */
  options?: { value: string; label: string; color?: string }[];
  /** Which entity tabs show this filter. */
  entityTypes: SearchEntityType[];
}

// --- Search State ---

/** Full search query (text, filters, sort, pagination). */
export interface SearchQuery {
  text: string;
  entityType: SearchEntityType | "all";
  filters: SearchFilter[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

/** Client-side search state (query, results, loading, recent/saved). */
export interface SearchState {
  query: SearchQuery;
  results: SearchResult[];
  totalResults: number;
  /** Result counts per entity type (for tab badges). */
  resultsByType: Record<SearchEntityType, number>;
  isLoading: boolean;
  error?: string;
  recentSearches: string[];
  savedSearches: SavedSearch[];
}

/** A saved search (name + query + sharing). */
export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: string;
  createdBy: string;
  /** Visible to whole org or just creator. */
  isShared: boolean;
}

// --- Display Options (Linear-style) ---

/** Layout mode for result list. */
export type SearchDisplayMode = "list" | "compact" | "grid";

/** User preferences for how results are displayed. */
export interface SearchDisplayOptions {
  mode: SearchDisplayMode;
  showThumbnails: boolean;
  showMetadata: boolean;
  /** When on "all" tab, group results by entity type. */
  groupByType: boolean;
}
