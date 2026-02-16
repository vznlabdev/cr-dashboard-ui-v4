"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Clapperboard, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb";
import { useStoryboard } from "@/hooks/useStoryboard";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Storyboard, StoryboardStatus } from "@/types/storyboard";
import { NewStoryboardDialog } from "@/components/storyboards/NewStoryboardDialog";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const STATUS_CLASS: Record<StoryboardStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  in_review: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  in_production: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  archived: "bg-muted text-muted-foreground border-border",
};

const FORMAT_LABELS: Record<string, string> = {
  commercial: "Commercial",
  short_form: "Short Form",
  brand_film: "Brand Film",
  explainer: "Explainer",
  music_video: "Music Video",
  presentation: "Presentation",
  social_video: "Social Video",
  custom: "Custom",
};

export default function ProjectStoryboardsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const { getStoryboards, createStoryboard } = useStoryboard();
  const { getProjectById } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const project = getProjectById(projectId);
  const storyboards = getStoryboards(projectId);

  const handleCreated = useCallback(
    (storyboard: Storyboard) => {
      createStoryboard(storyboard);
      setDialogOpen(false);
      router.push(`/storyboards/${storyboard.id}`);
    },
    [router, createStoryboard]
  );

  if (!project) {
    return null;
  }

  return (
    <PageContainer className="space-y-0 animate-fade-in">
      <LinearBreadcrumb
        backHref={`/projects/${projectId}`}
        segments={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${projectId}` },
          { label: "Storyboards" },
        ]}
        className="mb-3"
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Storyboards</h1>
        <NewStoryboardDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={handleCreated}
          preselectedProjectId={projectId}
        />
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Storyboard
        </Button>
      </div>

      {storyboards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 p-12 text-center">
          <Clapperboard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No storyboards in this project</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a storyboard to plan frames, script, and production.
          </p>
          <Button className="mt-4" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Storyboard
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {storyboards.map((sb) => (
            <Link
              key={sb.id}
              href={`/storyboards/${sb.id}`}
              className={cn(
                "rounded-lg border border-border bg-card p-4 transition-colors",
                "hover:border-primary/30 hover:bg-muted/20"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-medium line-clamp-2">{sb.title}</span>
                <Badge variant="outline" className={cn("shrink-0 text-[10px]", STATUS_CLASS[sb.status])}>
                  {sb.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{FORMAT_LABELS[sb.format] ?? sb.format}</span>
                <span>·</span>
                <span>{sb.frames.length} frames</span>
                <span>·</span>
                <span>~{sb.totalDurationSeconds}s</span>
              </div>
              {sb.projectName && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{sb.projectName}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
