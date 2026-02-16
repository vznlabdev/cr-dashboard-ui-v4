"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, Zap, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchMockIndex } from "@/lib/data/search-mock-data";
import type { SearchResult, SearchEntityType } from "@/types/search";

const RECENT_STORAGE_KEY = "cr-search-recent";
const MAX_RECENT = 8;
const MAX_PER_TYPE = 2;
const MAX_QUICK_RESULTS = 8;

const TYPE_ORDER: SearchEntityType[] = [
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

const TYPE_LABELS: Record<SearchEntityType, string> = {
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

const QUICK_ACTIONS = [
  { label: "Create new task", href: "/tasks?newTask=true", shortcut: "⌘N" },
  { label: "Upload asset", href: "/creative/assets", shortcut: "⌘U" },
  { label: "New workflow", href: "/workflows/new", shortcut: "" },
];

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

function limitResults(results: SearchResult[]): SearchResult[] {
  const byType: Record<SearchEntityType, SearchResult[]> = {} as Record<
    SearchEntityType,
    SearchResult[]
  >;
  for (const t of TYPE_ORDER) byType[t] = [];
  for (const r of results) {
    if (byType[r.entityType].length < MAX_PER_TYPE) byType[r.entityType].push(r);
  }
  const out: SearchResult[] = [];
  for (const t of TYPE_ORDER) {
    for (const r of byType[t]) {
      if (out.length >= MAX_QUICK_RESULTS) return out;
      out.push(r);
    }
  }
  return out;
}

function resultSubtitle(r: SearchResult): string {
  const m = r.metadata;
  if (r.entityType === "asset")
    return [m.creationMethod?.replace("_", " ") ?? "", m.fileSize].filter(Boolean).join(" · ");
  if (r.entityType === "project")
    return [m.status, m.assetCount != null ? `${m.assetCount} assets` : null].filter(Boolean).join(" · ");
  if (r.entityType === "contract")
    return [m.status, m.contractValue != null ? `$${(m.contractValue / 1000).toFixed(0)}K` : null].filter(Boolean).join(" · ");
  return [m.status, m.brand ?? r.subtitle].filter(Boolean).join(" · ");
}

export interface QuickSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearchOverlay({ open, onOpenChange }: QuickSearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const trimmedQuery = query.trim();
  const searchResults = useMemo(
    () => (trimmedQuery ? searchMockIndex(trimmedQuery, "all") : []),
    [trimmedQuery]
  );
  const limitedResults = useMemo(() => limitResults(searchResults), [searchResults]);

  const hasQuery = trimmedQuery.length > 0;
  const totalCount = searchResults.length;
  const itemCount = limitedResults.length;

  const openToFullSearch = useCallback(() => {
    onOpenChange(false);
    const q = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : "";
    router.push(`/search${q}`);
  }, [onOpenChange, router, trimmedQuery]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        openToFullSearch();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onOpenChange, openToFullSearch]);

  useEffect(() => {
    if (open) {
      setRecentSearches(loadRecentSearches());
      setQuery("");
      setSelectedIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  const selectables = hasQuery
    ? [
        ...limitedResults.map((r) => ({ type: "result" as const, result: r })),
        ...(totalCount > 0 ? [{ type: "seeAll" as const, count: totalCount }] : []),
      ]
    : [
        ...recentSearches.map((q) => ({ type: "recent" as const, query: q })),
        ...QUICK_ACTIONS.map((a) => ({ type: "action" as const, ...a })),
      ];

  useEffect(() => {
    setSelectedIndex((i) => Math.min(Math.max(0, i), selectables.length - 1));
  }, [selectables.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % selectables.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + selectables.length) % selectables.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const sel = selectables[selectedIndex];
      if (!sel) return;
      if (sel.type === "result") {
        onOpenChange(false);
        router.push(sel.result.url);
      } else if (sel.type === "seeAll") {
        openToFullSearch();
      } else if (sel.type === "recent") {
        setQuery(sel.query);
      } else if (sel.type === "action") {
        onOpenChange(false);
        router.push(sel.href);
      }
    }
  };

  const handleClearRecent = () => {
    localStorage.setItem(RECENT_STORAGE_KEY, "[]");
    setRecentSearches([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[640px] p-0 gap-0 overflow-hidden border-border bg-background shadow-xl"
        onPointerDownOutside={() => onOpenChange(false)}
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <DialogTitle className="sr-only">Quick search</DialogTitle>

        <div className="flex items-center border-b border-border px-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="h-12 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-base"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!hasQuery && (
            <>
              {recentSearches.length > 0 && (
                <div className="border-b border-border px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Recent</span>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="mt-1">
                    {recentSearches.slice(0, MAX_RECENT).map((q, i) => (
                      <li key={`${q}-${i}`}>
                        <button
                          type="button"
                          onClick={() => setQuery(q)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                            selectables[selectedIndex]?.type === "recent" &&
                              (selectables[selectedIndex] as { query: string }).query === q
                              ? "bg-muted"
                              : "hover:bg-muted/70"
                          )}
                        >
                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{q}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Quick Actions</span>
                <ul className="mt-1">
                  {QUICK_ACTIONS.map((a, i) => (
                    <li key={a.href}>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          router.push(a.href);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/70",
                          selectables[selectedIndex]?.type === "action" &&
                            (selectables[selectedIndex] as { href: string }).href === a.href &&
                            "bg-muted"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                          {a.label}
                        </span>
                        {a.shortcut && (
                          <kbd className="text-[10px] text-muted-foreground">{a.shortcut}</kbd>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {hasQuery && (
            <>
              {limitedResults.length > 0 && (
                <div className="px-3 py-2">
                  {TYPE_ORDER.map((type) => {
                    const items = limitedResults.filter((r) => r.entityType === type);
                    if (items.length === 0) return null;
                    return (
                      <div key={type} className="mb-3 last:mb-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          {TYPE_LABELS[type]}
                        </span>
                        <ul className="mt-1">
                          {items.map((r) => {
                            const idx = limitedResults.indexOf(r);
                            const isSelected = selectables[selectedIndex]?.type === "result" && (selectables[selectedIndex] as { result: SearchResult }).result.id === r.id;
                            return (
                              <li key={r.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenChange(false);
                                    router.push(r.url);
                                  }}
                                  className={cn(
                                    "flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/70",
                                    isSelected && "bg-muted"
                                  )}
                                >
                                  <span className="font-medium truncate w-full">{r.title}</span>
                                  <span className="text-xs text-muted-foreground truncate w-full">
                                    {resultSubtitle(r)}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
              {totalCount > 0 && (
                <div className="border-t border-border px-3 py-2">
                  <button
                    type="button"
                    onClick={openToFullSearch}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted/70",
                      selectables[selectedIndex]?.type === "seeAll" && "bg-muted"
                    )}
                  >
                    <span>See all {totalCount} results</span>
                    <kbd className="rounded border px-1.5 font-mono text-[10px]">Enter</kbd>
                  </button>
                </div>
              )}
              {totalCount === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for &quot;{trimmedQuery}&quot;
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={openToFullSearch}
            className="flex items-center gap-1 hover:text-foreground hover:underline"
          >
            Open full search
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <kbd className="hidden sm:inline rounded border px-1.5 font-mono">⌘⇧F</kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
