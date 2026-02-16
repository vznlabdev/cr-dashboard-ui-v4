"use client";

import {
  Search,
  FileImage,
  FolderKanban,
  CheckSquare,
  GitBranch,
  Palette,
  User,
  Users,
  ShieldAlert,
  FileText,
  Shield,
} from "lucide-react";
import type { SearchEntityType } from "@/types/search";
import { cn } from "@/lib/utils";

const TABS: { id: SearchEntityType | "all"; label: string; Icon: typeof Search }[] = [
  { id: "all", label: "All", Icon: Search },
  { id: "asset", label: "Assets", Icon: FileImage },
  { id: "project", label: "Projects", Icon: FolderKanban },
  { id: "task", label: "Tasks", Icon: CheckSquare },
  { id: "workflow", label: "Workflows", Icon: GitBranch },
  { id: "brand", label: "Brands", Icon: Palette },
  { id: "talent", label: "Talent", Icon: User },
  { id: "team_member", label: "Team", Icon: Users },
  { id: "compliance", label: "Compliance", Icon: ShieldAlert },
  { id: "contract", label: "Contracts", Icon: FileText },
  { id: "insurance", label: "Insurance", Icon: Shield },
];

export interface EntityTabsProps {
  activeType: SearchEntityType | "all";
  counts: Record<SearchEntityType, number>;
  onChange: (type: SearchEntityType | "all") => void;
}

export function EntityTabs({ activeType, counts, onChange }: EntityTabsProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="relative">
      <div
        className={cn(
          "flex gap-0.5 overflow-x-auto pb-0 scrollbar-thin snap-x snap-mandatory",
          "max-md:[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]",
          "max-md:[-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]"
        )}
      >
        {TABS.map(({ id, label, Icon }) => {
          const count = id === "all" ? total : (counts[id as SearchEntityType] ?? 0);
          const isActive = activeType === id;
          const isZero = count === 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "flex shrink-0 snap-start items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm transition-[border-color,color,background] duration-150",
                "hover:bg-gray-100 dark:hover:bg-gray-800/60",
                isActive
                  ? "border-blue-500 font-semibold text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                isZero && !isActive && "text-gray-400 dark:text-gray-500"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{label}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                  isZero && !isActive && "opacity-70"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
