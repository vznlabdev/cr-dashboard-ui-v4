"use client";

import {
  FileImage,
  FolderKanban,
  CheckSquare,
  GitBranch,
  Clapperboard,
  Palette,
  User,
  Users,
  Shield,
  FileText,
} from "lucide-react";
import type { SearchEntityType, SearchDisplayMode, SearchResult } from "@/types/search";
import { SearchResultItem } from "./SearchResultItem";

const ENTITY_ICONS: Record<
  SearchEntityType,
  { Icon: typeof FileImage; label: string }
> = {
  asset: { Icon: FileImage, label: "Assets" },
  project: { Icon: FolderKanban, label: "Projects" },
  task: { Icon: CheckSquare, label: "Tasks" },
  workflow: { Icon: GitBranch, label: "Workflows" },
  storyboard: { Icon: Clapperboard, label: "Storyboards" },
  brand: { Icon: Palette, label: "Brands" },
  talent: { Icon: User, label: "Talent" },
  team_member: { Icon: Users, label: "Team" },
  compliance: { Icon: Shield, label: "Compliance" },
  contract: { Icon: FileText, label: "Contracts" },
  insurance: { Icon: Shield, label: "Insurance" },
};

export interface SearchResultGroupProps {
  entityType: SearchEntityType;
  items: { result: SearchResult; globalIndex: number }[];
  totalCount: number;
  displayMode: SearchDisplayMode;
  onShowAll: () => void;
  selectedIndex: number;
  onSelectResult: (result: SearchResult) => void;
}

export function SearchResultGroup({
  entityType,
  items,
  totalCount,
  displayMode,
  onShowAll,
  selectedIndex,
  onSelectResult,
}: SearchResultGroupProps) {
  const { Icon, label } = ENTITY_ICONS[entityType];
  const labelLower = label.toLowerCase();

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{totalCount} results</span>
      </div>
      <div
        className={
          displayMode === "grid"
            ? "grid grid-cols-2 gap-3 p-3 md:grid-cols-3"
            : "divide-y divide-border"
        }
      >
        {items.map(({ result, globalIndex }) => {
          const isSelected = selectedIndex === globalIndex;
          return (
            <SearchResultItem
              key={result.id}
              result={result}
              isSelected={isSelected}
              displayMode={displayMode}
              onClick={() => onSelectResult(result)}
            />
          );
        })}
      </div>
      {totalCount > 3 && (
        <div className="px-4 py-2">
          <button
            type="button"
            onClick={onShowAll}
            className="text-sm text-primary hover:underline"
          >
            Show all {totalCount} {labelLower} →
          </button>
        </div>
      )}
    </div>
  );
}
