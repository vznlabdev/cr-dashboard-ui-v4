"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useId,
} from "react";
import { Search, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  recentSearches?: string[];
  onSelectRecent?: (query: string) => void;
  onClearRecent?: () => void;
  disabled?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search projects, assets, tasks, workflows...",
  autoFocus = true,
  recentSearches = [],
  onSelectRecent,
  onClearRecent,
  disabled = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listId = useId();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const flushAndEmit = useCallback(
    (v: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      const trimmed = v.trim();
      onChange(trimmed);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setLocalValue(v);
      setHighlightedIndex(-1);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onChange(v.trim());
      }, DEBOUNCE_MS);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const showRecent =
        isFocused && !localValue.trim() && recentSearches.length > 0;

      if (e.key === "Enter") {
        e.preventDefault();
        flushAndEmit(localValue);
        if (showRecent && highlightedIndex >= 0 && recentSearches[highlightedIndex]) {
          onSelectRecent?.(recentSearches[highlightedIndex]);
          setHighlightedIndex(-1);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (localValue.trim()) {
          setLocalValue("");
          onClear();
        } else {
          inputRef.current?.blur();
        }
        setHighlightedIndex(-1);
        return;
      }

      if (!showRecent) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) =>
          i < recentSearches.length - 1 ? i + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) =>
          i <= 0 ? recentSearches.length - 1 : i - 1
        );
      }
    },
    [
      isFocused,
      localValue,
      recentSearches,
      highlightedIndex,
      flushAndEmit,
      onClear,
      onSelectRecent,
    ]
  );

  const showDropdown =
    isFocused && !localValue.trim() && recentSearches.length > 0;
  const displayList = recentSearches.slice(0, 8);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-input bg-background px-3 shadow-sm transition-shadow",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        )}
      >
        <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
        <Input
          ref={inputRef}
          type="search"
          value={localValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="h-12 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listId : undefined}
          aria-activedescendant={
            showDropdown && highlightedIndex >= 0
              ? `${listId}-item-${highlightedIndex}`
              : undefined
          }
        />
        {localValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setLocalValue("");
              onClear();
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
              }
            }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <kbd className="hidden sm:inline-flex h-6 select-none items-center rounded border border-gray-200 bg-gray-50 px-2 font-mono text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500">
            ⌘K
          </kbd>
        )}
      </div>

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover py-2 shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Recent Searches
            </span>
            {onClearRecent && (
              <button
                type="button"
                onClick={() => {
                  onClearRecent();
                  inputRef.current?.focus();
                }}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {displayList.map((q, i) => (
              <li key={`${q}-${i}`}>
                <button
                  type="button"
                  id={`${listId}-item-${i}`}
                  role="option"
                  aria-selected={highlightedIndex === i}
                  onClick={() => {
                    onSelectRecent?.(q);
                    inputRef.current?.focus();
                  }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    highlightedIndex === i
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
    </div>
  );
}
