"use client";

import { useRouter } from "next/navigation";
import {
  FileImage,
  FolderKanban,
  CheckSquare,
  GitBranch,
  Palette,
  User,
  Users,
  Shield,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { SearchResult, SearchEntityType, SearchDisplayMode } from "@/types/search";

const ENTITY_ICONS: Record<
  SearchEntityType,
  { Icon: typeof FileImage; color: string }
> = {
  asset: { Icon: FileImage, color: "text-blue-600" },
  project: { Icon: FolderKanban, color: "text-purple-600" },
  task: { Icon: CheckSquare, color: "text-green-600" },
  workflow: { Icon: GitBranch, color: "text-orange-600" },
  brand: { Icon: Palette, color: "text-pink-600" },
  talent: { Icon: User, color: "text-indigo-600" },
  team_member: { Icon: Users, color: "text-gray-600" },
  compliance: { Icon: Shield, color: "text-red-600" },
  contract: { Icon: FileText, color: "text-amber-600" },
  insurance: { Icon: Shield, color: "text-teal-600" },
};

const STATUS_COLORS: Record<string, string> = {
  green: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  gray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  orange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  displayMode: SearchDisplayMode;
  onClick: () => void;
}

export function SearchResultItem({
  result,
  isSelected,
  displayMode,
  onClick,
}: SearchResultItemProps) {
  const router = useRouter();
  const { Icon, color } = ENTITY_ICONS[result.entityType];
  const m = result.metadata;
  const statusColor = m.statusColor ? STATUS_COLORS[m.statusColor] ?? STATUS_COLORS.gray : STATUS_COLORS.gray;

  const handleClick = () => {
    onClick();
    router.push(result.url);
  };

  const titleContent = result.highlights?.find((h) => h.field === "title")?.snippet ? (
    <span dangerouslySetInnerHTML={{ __html: result.highlights.find((h) => h.field === "title")!.snippet }} />
  ) : (
    <span className="truncate">{result.title}</span>
  );

  if (displayMode === "grid") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-lg border text-left transition-colors",
          "hover:bg-muted/50",
          isSelected && "border-l-2 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
        )}
      >
        <div className="aspect-square w-full bg-muted/50 flex items-center justify-center overflow-hidden">
          {result.entityType === "asset" && result.thumbnail ? (
            <img src={result.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon className={cn("h-10 w-10", color)} />
          )}
        </div>
        <div className="p-2">
          <p className="truncate text-sm font-medium">{result.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[result.subtitle, m.fileType ?? m.brand].filter(Boolean).join(" · ")}
          </p>
          {m.status && (
            <Badge variant="outline" className={cn("mt-1 text-[10px]", statusColor)}>
              {m.status}
            </Badge>
          )}
        </div>
      </button>
    );
  }

  if (displayMode === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
          "hover:bg-muted/50",
          isSelected && "border-l-2 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", color)} />
        {result.entityType === "asset" && result.thumbnail ? (
          <img src={result.thumbnail} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
        ) : null}
        <span className="min-w-0 flex-1 truncate font-medium">{result.title}</span>
        {m.status && (
          <Badge variant="outline" className={cn("shrink-0 text-[10px]", statusColor)}>
            {m.status}
          </Badge>
        )}
      </button>
    );
  }

  // List mode (default)
  const subtitle = getSubtitle(result);
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-muted/50",
        isSelected && "border-l-2 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />
      {result.entityType === "asset" && result.thumbnail ? (
        <img src={result.thumbnail} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 truncate font-medium">{titleContent}</span>
          {m.status && (
            <Badge variant="outline" className={cn("shrink-0 text-xs", statusColor)}>
              {m.status}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
        )}
      </div>
    </button>
  );
}

function getSubtitle(result: SearchResult): string {
  const m = result.metadata;
  const date = formatDate(result.updatedAt);

  switch (result.entityType) {
    case "asset":
      return [
        result.subtitle,
        m.fileType ? capitalize(m.fileType) : null,
        m.creationMethod ? m.creationMethod.replace(/_/g, " ") : null,
        m.aclarScore != null ? `ACLAR: ${m.aclarScore}` : null,
        m.fileSize,
        date,
      ].filter(Boolean).join(" · ");
    case "project":
      return [
        m.brand ?? result.subtitle,
        m.status,
        m.assetCount != null ? `${m.assetCount} assets` : null,
        date,
      ].filter(Boolean).join(" · ");
    case "task":
      return [
        m.assignee ? `Assigned: ${m.assignee}` : null,
        m.status,
        m.priority ? capitalize(m.priority) : null,
        m.dueDate,
      ].filter(Boolean).join(" · ");
    case "workflow":
      return [result.subtitle, m.status, date].filter(Boolean).join(" · ");
    case "brand":
      return [result.description, date].filter(Boolean).join(" · ");
    case "talent":
      return [result.subtitle, m.status, date].filter(Boolean).join(" · ");
    case "team_member":
      return [result.subtitle, m.status, date].filter(Boolean).join(" · ");
    case "compliance":
      return [
        m.severity ? capitalize(m.severity) : null,
        m.status,
        date,
      ].filter(Boolean).join(" · ");
    case "contract":
      return [
        result.subtitle,
        m.contractValue != null ? formatCurrency(m.contractValue) : null,
        m.expirationDate,
      ].filter(Boolean).join(" · ");
    case "insurance":
      return [
        m.policyNumber,
        m.riskLevel ? capitalize(m.riskLevel) : null,
        m.status,
        date,
      ].filter(Boolean).join(" · ");
    default:
      return [result.subtitle, m.status, date].filter(Boolean).join(" · ");
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
