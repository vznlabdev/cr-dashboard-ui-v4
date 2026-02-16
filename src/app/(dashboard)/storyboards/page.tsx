"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film,
  Plus,
  Search,
  Clapperboard,
  Smartphone,
  BarChart3,
  Music,
  Presentation,
  Video,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer } from "@/components/layout/PageContainer";
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb";
import { useStoryboard } from "@/hooks/useStoryboard";
import { cn } from "@/lib/utils";
import type { Storyboard, StoryboardFormat, StoryboardStatus } from "@/types/storyboard";
import { Progress } from "@/components/ui/progress";
import { NewStoryboardDialog } from "@/components/storyboards/NewStoryboardDialog";

// --- Format config (badge icon + color) ---
const FORMAT_CONFIG: Record<
  StoryboardFormat,
  { label: string; icon: LucideIcon; className: string }
> = {
  commercial: {
    label: "Commercial",
    icon: Clapperboard,
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  short_form: {
    label: "Short Form",
    icon: Smartphone,
    className: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  },
  brand_film: {
    label: "Brand Film",
    icon: Film,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  explainer: {
    label: "Explainer",
    icon: BarChart3,
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  music_video: {
    label: "Music Video",
    icon: Music,
    className: "bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  },
  presentation: {
    label: "Presentation",
    icon: Presentation,
    className: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  },
  social_video: {
    label: "Social Video",
    icon: Video,
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  },
  custom: {
    label: "Custom",
    icon: FileQuestion,
    className: "bg-muted text-muted-foreground border-border",
  },
};

const STATUS_TABS: { value: StoryboardStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In Review" },
  { value: "in_production", label: "In Production" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
  { value: "duration", label: "Duration" },
  { value: "progress", label: "Progress" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  if (diffD < 30) return `${Math.floor(diffD / 7)}w ago`;
  return d.toLocaleDateString();
}

function assetProgress(sb: Storyboard): { withAssets: number; total: number; pct: number } {
  const total = sb.frames.length;
  const withAssets = sb.frames.filter((f) => f.linkedAssetIds?.length > 0).length;
  return { withAssets, total, pct: total ? Math.round((withAssets / total) * 100) : 0 };
}

// Completed = approved or completed status for display
function matchesCompleted(s: StoryboardStatus): boolean {
  return s === "approved" || s === "completed";
}

export default function StoryboardsPage() {
  const router = useRouter();
  const { storyboards, getStoryboards, createStoryboard } = useStoryboard();
  const [statusTab, setStatusTab] = useState<StoryboardStatus | "all">("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortValue>("newest");

  const allList = getStoryboards();

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allList.length };
    STATUS_TABS.slice(1).forEach(({ value }) => {
      if (value === "completed") {
        counts[value] = allList.filter((sb) => matchesCompleted(sb.status)).length;
      } else {
        counts[value] = allList.filter((sb) => sb.status === value).length;
      }
    });
    return counts;
  }, [allList]);

  const projectOptions = useMemo(() => {
    const names = new Set<string>();
    allList.forEach((sb) => {
      if (sb.projectName) names.add(sb.projectName);
    });
    return Array.from(names).sort();
  }, [allList]);

  const filtered = useMemo(() => {
    let list = allList;

    if (statusTab !== "all") {
      if (statusTab === "completed") {
        list = list.filter((sb) => matchesCompleted(sb.status));
      } else {
        list = list.filter((sb) => sb.status === statusTab);
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (sb) =>
          sb.title.toLowerCase().includes(q) ||
          (sb.description ?? "").toLowerCase().includes(q)
      );
    }

    if (formatFilter !== "all") {
      list = list.filter((sb) => sb.format === formatFilter);
    }

    if (projectFilter !== "all") {
      list = list.filter((sb) => sb.projectName === projectFilter);
    }

    const sorted = [...list];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        break;
      case "name":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "duration":
        sorted.sort((a, b) => b.totalDurationSeconds - a.totalDurationSeconds);
        break;
      case "progress":
        sorted.sort((a, b) => assetProgress(b).pct - assetProgress(a).pct);
        break;
    }
    return sorted;
  }, [allList, statusTab, search, formatFilter, projectFilter, sort]);

  return (
    <PageContainer className="space-y-6">
      <LinearBreadcrumb segments={[{ label: "Storyboards" }]} className="mb-3" />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Storyboards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Plan your creative vision frame by frame
          </p>
        </div>
        <Button size="sm" onClick={() => setNewDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Storyboard
        </Button>
      </div>

      {/* Status tabs — active: blue underline */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {STATUS_TABS.map(({ value, label }) => {
          const count = statusCounts[value] ?? 0;
          const isActive = statusTab === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setStatusTab(value)}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label} {count}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search storyboards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            {(Object.keys(FORMAT_CONFIG) as StoryboardFormat[]).map((f) => (
              <SelectItem key={f} value={f}>
                {FORMAT_CONFIG[f].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projectOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {allList.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <Film className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No storyboards match your filters</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try changing the status tab or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sb) => (
            <StoryboardCard key={sb.id} storyboard={sb} />
          ))}
        </div>
      )}

      <NewStoryboardDialog
        isOpen={newDialogOpen}
        onClose={() => setNewDialogOpen(false)}
        onCreated={(sb) => {
          createStoryboard(sb);
          router.push(`/storyboards/${sb.id}`);
        }}
      />
    </PageContainer>
  );
}

function StoryboardCard({ storyboard: sb }: { storyboard: Storyboard }) {
  const formatConf = FORMAT_CONFIG[sb.format];
  const FormatIcon = formatConf.icon;
  const progress = assetProgress(sb);
  const hasThumbnails = sb.frames.some((f) => f.thumbnailUrl);
  const thumbFrames = sb.frames.slice(0, 3);

  const statusLabel =
    sb.status === "approved" || sb.status === "completed"
      ? "Completed"
      : sb.status.replace("_", " ");

  return (
    <Link
      href={`/storyboards/${sb.id}`}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card overflow-hidden",
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted/50 overflow-hidden">
        {hasThumbnails && thumbFrames.some((f) => f.thumbnailUrl) ? (
          thumbFrames.filter((f) => f.thumbnailUrl).length >= 3 ? (
            <div className="absolute inset-0 flex">
              {thumbFrames.map((f) => (
                <div
                  key={f.id}
                  className="flex-1 bg-cover bg-center"
                  style={{
                    backgroundImage: f.thumbnailUrl ? `url(${f.thumbnailUrl})` : undefined,
                    backgroundColor: f.backgroundColor ?? "var(--muted)",
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: thumbFrames[0]?.thumbnailUrl
                  ? `url(${thumbFrames[0].thumbnailUrl})`
                  : undefined,
                backgroundColor: thumbFrames[0]?.backgroundColor ?? "var(--muted)",
              }}
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/70">
            <FormatIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-sm font-medium text-white">Open</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <p className="font-semibold text-sm truncate" title={sb.title}>
          {sb.title}
        </p>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium",
            formatConf.className
          )}
        >
          <FormatIcon className="h-3 w-3" />
          {formatConf.label}
        </span>
        <p className="text-xs text-muted-foreground">
          {sb.frames.length} frames · {sb.totalDurationSeconds}s
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {[sb.projectName, sb.brandName].filter(Boolean).join(" · ") || "No project"}
          {" · "}
          <span className="capitalize">{statusLabel}</span>
        </p>
        <Progress value={progress.withAssets} max={progress.total || 1} className="h-1.5" />
        <p className="text-[11px] text-muted-foreground">
          Updated {relativeTime(sb.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

function EmptyState() {
  const quickFormats: { format: StoryboardFormat; label: string }[] = [
    { format: "short_form", label: "Short Form" },
    { format: "commercial", label: "Commercial" },
    { format: "brand_film", label: "Brand Film" },
    { format: "custom", label: "Custom" },
  ];

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
      <Film className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
      <p className="text-base font-medium text-foreground">Create your first storyboard</p>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Start with a format or create a custom storyboard.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {quickFormats.map(({ format, label }) => (
          <Button key={format} variant="outline" size="sm" asChild>
            <Link href={`/storyboards/new?format=${format}`}>{label}</Link>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Or{" "}
        <Link href="/storyboards/new" className="text-primary hover:underline">
          start from scratch
        </Link>
      </p>
    </div>
  );
}
