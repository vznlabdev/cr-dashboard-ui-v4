"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface SearchShortcutsContextValue {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const SearchShortcutsContext = createContext<SearchShortcutsContextValue | null>(
  null
);

function isInputLike(
  target: EventTarget | null
): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  const role = target.getAttribute("role")?.toLowerCase();
  const isContentEditable = target.isContentEditable;
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    role === "combobox" ||
    role === "searchbox" ||
    role === "textbox" ||
    isContentEditable
  );
}

export function SearchShortcutsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isInputLike(e.target as EventTarget | null)) return;

      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // ⌘K / Ctrl+K → open quick search overlay
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
        return;
      }

      // ⌘⇧F / Ctrl+Shift+F → full search page
      if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(false);
        router.push("/search");
        return;
      }

      // Escape → close overlay
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <SearchShortcutsContext.Provider
      value={{ searchOpen, setSearchOpen }}
    >
      {children}
    </SearchShortcutsContext.Provider>
  );
}

export function useSearchShortcuts(): SearchShortcutsContextValue {
  const ctx = useContext(SearchShortcutsContext);
  if (!ctx) {
    throw new Error(
      "useSearchShortcuts must be used within SearchShortcutsProvider"
    );
  }
  return ctx;
}
