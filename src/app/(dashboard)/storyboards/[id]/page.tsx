"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clapperboard,
  Copy,
  Archive,
  Trash2,
  Share2,
  Download,
  MoreHorizontal,
  LayoutList,
  LayoutGrid,
  Film,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStoryboard } from "@/hooks/useStoryboard";
import { useToolWhitelist } from "@/hooks/useToolWhitelist";
import { TimelineStrip as TimelineStripComponent } from "@/components/storyboards/TimelineStrip";
import { FrameDetail as FrameDetailComponent, FrameDetailEmpty } from "@/components/storyboards/FrameDetail";
import { FrameEditor as FrameEditorComponent } from "@/components/storyboards/FrameEditor";
import { GridView as GridViewComponent } from "@/components/storyboards/views/GridView";
import { ListView as ListViewComponent } from "@/components/storyboards/views/ListView";
import { ScriptPanel as ScriptPanelComponent } from "@/components/storyboards/ScriptPanel";
import { ExportDialog as ExportDialogComponent } from "@/components/storyboards/ExportDialog";
import { ShareDialog as ShareDialogComponent } from "@/components/storyboards/ShareDialog";
import { LinearBreadcrumb } from "@/components/navigation/LinearBreadcrumb";
import { cn } from "@/lib/utils";
import type {
  Storyboard,
  StoryboardStatus,
  TimelineViewState,
} from "@/types/storyboard";

// Format icon for header (reuse one or map)
const FORMAT_ICONS: Record<string, typeof Clapperboard> = {
  commercial: Clapperboard,
  short_form: Clapperboard,
  brand_film: Film,
  explainer: LayoutList,
  music_video: Film,
  presentation: LayoutGrid,
  social_video: Film,
  custom: Film,
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

const STATUS_BADGE_CLASS: Record<StoryboardStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  in_review: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  in_production: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  archived: "bg-muted text-muted-foreground border-border",
};

const initialTimelineView = (): TimelineViewState => ({
  zoom: 1,
  scrollPosition: 0,
  selectedFrameId: null,
  playbackPosition: 0,
  isPlaying: false,
  showScript: false,
  showAudioTrack: true,
  viewMode: "timeline",
});

export default function StoryboardEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  const {
    getStoryboard,
    updateStoryboard,
    deleteStoryboard,
    createStoryboard,
    addFrame,
    updateFrame,
    deleteFrame,
    reorderFrame,
  } = useStoryboard();

  const [loading, setLoading] = useState(true);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [timelineView, setTimelineView] = useState<TimelineViewState>(initialTimelineView);
  const [isScriptPanelOpen, setIsScriptPanelOpen] = useState(false);
  const [frameEditorOpen, setFrameEditorOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { tools: availableTools } = useToolWhitelist();

  const storyboard = id ? getStoryboard(id) : null;

  // Simulate 300ms load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const setSelectedFrame = useCallback((frameId: string | null) => {
    setSelectedFrameId(frameId);
    setTimelineView((prev) => ({ ...prev, selectedFrameId: frameId }));
  }, []);

  const setViewMode = useCallback(
    (viewMode: "timeline" | "grid" | "list") => {
      setTimelineView((prev) => ({ ...prev, viewMode }));
    },
    []
  );

  const toggleScriptPanel = useCallback(() => {
    setIsScriptPanelOpen((prev) => !prev);
    setTimelineView((prev) => ({ ...prev, showScript: !prev.showScript }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!storyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "Escape":
          setSelectedFrame(null);
          if (editingTitle) setEditingTitle(false);
          break;
        case "ArrowLeft": {
          if (!selectedFrameId) return;
          const idx = storyboard.frames.findIndex((f) => f.id === selectedFrameId);
          if (idx > 0) setSelectedFrame(storyboard.frames[idx - 1].id);
          break;
        }
        case "ArrowRight": {
          if (!selectedFrameId) {
            if (storyboard.frames.length > 0) setSelectedFrame(storyboard.frames[0].id);
            return;
          }
          const idx = storyboard.frames.findIndex((f) => f.id === selectedFrameId);
          if (idx < storyboard.frames.length - 1) setSelectedFrame(storyboard.frames[idx + 1].id);
          break;
        }
        case " ":
          e.preventDefault();
          setTimelineView((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
          break;
        case "Delete":
        case "Backspace":
          if (!selectedFrameId) return;
          e.preventDefault();
          if (window.confirm("Delete this frame?")) {
            deleteFrame(storyboard.id, selectedFrameId);
            const idx = storyboard.frames.findIndex((f) => f.id === selectedFrameId);
            const next = storyboard.frames[idx + 1] ?? storyboard.frames[idx - 1];
            setSelectedFrame(next?.id ?? null);
          }
          break;
        case "n":
        case "N":
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          addFrame(storyboard.id, selectedFrameId ?? undefined);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    storyboard,
    selectedFrameId,
    editingTitle,
    setSelectedFrame,
    deleteFrame,
    addFrame,
  ]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="h-14 shrink-0 border-b border-border bg-card animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-[55vh] shrink-0 bg-muted/30 animate-pulse" />
          <div className="h-[45vh] shrink-0 border-t border-border bg-muted/20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!id || !storyboard) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Storyboard not found.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/storyboards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Storyboards
          </Link>
        </Button>
      </div>
    );
  }

  const statusLabel =
    storyboard.status === "approved" ? "Completed" : storyboard.status.replace("_", " ");
  const FormatIcon = FORMAT_ICONS[storyboard.format] ?? Film;

  const handleTitleBlur = () => {
    setEditingTitle(false);
    const value = titleInputRef.current?.value?.trim();
    if (value && value !== storyboard.title) updateStoryboard(storyboard.id, { title: value });
  };

  const handleDuplicate = () => {
    const copy = createStoryboard({
      title: `${storyboard.title} (Copy)`,
      format: storyboard.format,
      status: "draft",
      aspectRatio: storyboard.aspectRatio,
      acts: [],
      frames: [],
      collaborators: [],
    });
    toast.success("Storyboard duplicated");
    router.push(`/storyboards/${copy.id}`);
  };

  const handleArchive = () => {
    updateStoryboard(storyboard.id, { status: "archived" });
    toast.success("Storyboard archived");
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this storyboard? This cannot be undone.")) return;
    deleteStoryboard(storyboard.id);
    toast.success("Storyboard deleted");
    router.push("/storyboards");
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {/* 1. Header (fixed top) */}
      <header className="shrink-0 border-b border-border bg-card px-4 py-3">
        <LinearBreadcrumb
          backHref="/storyboards"
          segments={[
            { label: "Storyboards", href: "/storyboards" },
            { label: storyboard.title },
          ]}
          className="mb-2 text-xs"
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/storyboards" aria-label="Back to Storyboards">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                defaultValue={storyboard.title}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
                className="min-w-[200px] bg-transparent text-lg font-semibold outline-none border-b border-transparent focus:border-primary"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="text-left text-lg font-semibold truncate hover:underline focus:outline-none focus:underline"
              >
                {storyboard.title}
              </button>
            )}
            <span
              className={cn(
                "shrink-0 rounded border px-2 py-0.5 text-xs font-medium capitalize",
                STATUS_BADGE_CLASS[storyboard.status]
              )}
            >
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={timelineView.viewMode === "timeline" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("timeline")}
            >
              Timeline
            </Button>
            <Button
              variant={timelineView.viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={timelineView.viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={isScriptPanelOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleScriptPanel}
            >
              <FileText className="h-4 w-4 mr-1" />
              Script
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
          <FormatIcon className="h-4 w-4 shrink-0" />
          <span>{FORMAT_LABELS[storyboard.format] ?? storyboard.format}</span>
          <span>·</span>
          <span>{storyboard.aspectRatio}</span>
          <span>·</span>
          <span>{storyboard.frames.length} frames</span>
          <span>·</span>
          <span>{storyboard.totalDurationSeconds}s</span>
        </div>
      </header>

      {/* 2. Frame Detail (top ~55%) */}
      <div className="flex-1 flex min-h-0">
        <main className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 min-h-0" style={{ minHeight: "55vh" }}>
            {selectedFrameId ? (
              (() => {
                const frame = storyboard.frames.find((f) => f.id === selectedFrameId);
                if (!frame) return <FrameDetailEmpty />;
                return (
                  <FrameDetailComponent
                    frame={frame}
                    storyboard={storyboard}
                    onUpdateFrame={(updates) =>
                      updateFrame(storyboard.id, frame.id, updates)
                    }
                    onOpenEditor={() => setFrameEditorOpen(true)}
                    onOpenComments={() => toast.info("Comments panel coming soon")}
                    onLinkTask={(frameId, taskId) =>
                      updateFrame(storyboard.id, frameId, { linkedTaskId: taskId })
                    }
                    onCreateTask={(frameId) => {
                      const f = storyboard.frames.find((x) => x.id === frameId);
                      if (!f) return;
                      toast.info(
                        `Create task: "Produce: ${(f.visualDescription || "Frame").slice(0, 30)}…" — connect backend to create and link.`
                      );
                    }}
                    onLinkWorkflow={(frameId, workflowId) =>
                      updateFrame(storyboard.id, frameId, { linkedWorkflowId: workflowId })
                    }
                    onLinkAsset={(frameId, assetId) => {
                      const f = storyboard.frames.find((x) => x.id === frameId);
                      const next = [...(f?.linkedAssetIds ?? []), assetId];
                      updateFrame(storyboard.id, frameId, { linkedAssetIds: next });
                    }}
                  />
                );
              })()
            ) : (
              <FrameDetailEmpty />
            )}
          </div>

          {/* 3. Timeline / Grid / List view (bottom ~45%) */}
          <div
            className="shrink-0 border-t border-border bg-muted/10"
            style={{ height: "45vh", minHeight: 160 }}
          >
            {timelineView.viewMode === "timeline" && (
              <TimelineStripComponent
                frames={storyboard.frames}
                acts={storyboard.acts}
                selectedFrameId={selectedFrameId}
                zoom={timelineView.zoom}
                onSelectFrame={(id) => setSelectedFrame(id)}
                onReorderFrame={(frameId, newIndex) =>
                  reorderFrame(storyboard.id, frameId, newIndex)
                }
                onAddFrame={(afterFrameId, frameType) =>
                  addFrame(storyboard.id, afterFrameId ?? undefined, frameType)
                }
                onDeleteFrame={(frameId) => deleteFrame(storyboard.id, frameId)}
                isPlaying={timelineView.isPlaying}
                playbackPosition={timelineView.playbackPosition}
                onPlayPause={() =>
                  setTimelineView((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
                }
                onZoomChange={(zoom) =>
                  setTimelineView((prev) => ({ ...prev, zoom }))
                }
                showScriptLane={timelineView.showScript}
                showAudioLane={timelineView.showAudioTrack}
              />
            )}
            {timelineView.viewMode === "grid" && (
              <GridViewComponent
                frames={storyboard.frames}
                acts={storyboard.acts}
                selectedFrameId={selectedFrameId}
                onSelectFrame={(id) => setSelectedFrame(id)}
                onReorderFrame={(frameId, newIndex) =>
                  reorderFrame(storyboard.id, frameId, newIndex)
                }
              />
            )}
            {timelineView.viewMode === "list" && (
              <ListViewComponent
                frames={storyboard.frames}
                acts={storyboard.acts}
                selectedFrameId={selectedFrameId}
                onSelectFrame={(id) => setSelectedFrame(id)}
                onUpdateFrame={(frameId, updates) =>
                  updateFrame(storyboard.id, frameId, updates)
                }
              />
            )}
          </div>
        </main>

        {/* Script panel (slide-out right) */}
        {isScriptPanelOpen && (
          <aside className="w-80 shrink-0 border-l border-border bg-card overflow-auto">
            <ScriptPanelComponent
              frames={storyboard.frames}
              selectedFrameId={selectedFrameId}
              onUpdateFrame={(frameId, updates) => updateFrame(storyboard.id, frameId, updates)}
              onSelectFrame={setSelectedFrameId}
              fullScript={storyboard.fullScript}
              onUpdateFullScript={(script) => updateStoryboard(storyboard.id, { fullScript: script })}
              onClose={() => setIsScriptPanelOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* Frame editor (slide-out panel) */}
      {frameEditorOpen && selectedFrameId && (() => {
        const frame = storyboard.frames.find((f) => f.id === selectedFrameId);
        if (!frame) return null;
        return (
          <FrameEditorComponent
            frame={frame}
            storyboard={storyboard}
            onChange={(updates) => updateFrame(storyboard.id, frame.id, updates)}
            onClose={() => setFrameEditorOpen(false)}
            availableTools={availableTools}
            onDeleteFrame={() => {
              deleteFrame(storyboard.id, frame.id);
              setSelectedFrame(null);
              setFrameEditorOpen(false);
            }}
          />
        );
      })()}

      {storyboard && (
        <>
          <ExportDialogComponent
            isOpen={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            storyboard={storyboard}
          />
          <ShareDialogComponent
            isOpen={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            storyboard={storyboard}
          />
        </>
      )}
    </div>
  );
}

