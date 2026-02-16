"use client";

import { useRef, useState } from "react";
import {
  Film,
  Type,
  ArrowLeftRight,
  Music,
  Image,
  Upload,
  Sparkles,
  FolderOpen,
  MessageCircle,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductionBridge } from "@/components/storyboards/ProductionBridge";
import { cn } from "@/lib/utils";
import type { Storyboard, StoryboardFrame, FrameType } from "@/types/storyboard";

const FRAME_TYPE: Record<FrameType, string> = {
  scene: "Scene",
  title_card: "Title Card",
  transition: "Transition",
  audio_only: "Audio Only",
  b_roll: "B-Roll",
};
const FRAME_ICON: Record<FrameType, typeof Film> = {
  scene: Film,
  title_card: Type,
  transition: ArrowLeftRight,
  audio_only: Music,
  b_roll: Image,
};

export interface FrameDetailProps {
  frame: StoryboardFrame;
  storyboard: Storyboard;
  onUpdateFrame: (updates: Partial<StoryboardFrame>) => void;
  onOpenEditor: () => void;
  onOpenComments: () => void;
  onLinkTask?: (frameId: string, taskId: string) => void;
  onCreateTask?: (frameId: string) => void;
  onLinkWorkflow?: (frameId: string, workflowId: string) => void;
  onLinkAsset?: (frameId: string, assetId: string) => void;
}

export function FrameDetail({
  frame,
  storyboard,
  onUpdateFrame,
  onOpenEditor,
  onOpenComments,
  onLinkTask,
  onCreateTask,
  onLinkWorkflow,
  onLinkAsset,
}: FrameDetailProps) {
  const [editingName, setEditingName] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frameIndex = storyboard.frames.findIndex((f) => f.id === frame.id);
  const frameNum = frameIndex >= 0 ? frameIndex + 1 : 0;
  const totalFrames = storyboard.frames.length;
  const Icon = FRAME_ICON[frame.frameType] ?? Film;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpdateFrame({ thumbnailUrl: url });
    e.target.value = "";
  };

  const handleGenerate = () => {
    if (frame.aiPromptSuggestion) {
      navigator.clipboard.writeText(frame.aiPromptSuggestion);
      toast.success("Prompt copied — open your AI tool to generate");
    } else {
      toast.info("No prompt suggestion for this frame");
    }
  };

  const handleNameBlur = () => {
    setEditingName(false);
    const v = nameRef.current?.value?.trim();
    if (v !== undefined && v !== frame.visualDescription) onUpdateFrame({ visualDescription: v });
  };

  const handleDurationBlur = () => {
    setEditingDuration(false);
    const v = Number(durationRef.current?.value);
    if (!Number.isNaN(v) && v > 0 && v !== frame.durationSeconds)
      onUpdateFrame({ durationSeconds: v });
  };

  const shotLabel = [frame.shotType?.replace("_", " "), frame.cameraMovement?.replace("_", " "), frame.transitionIn].filter(Boolean).join(" · ") || "—";
  const genStatus = frame.generationStatus ?? "not_started";
  return (
    <div className="grid grid-cols-[40%_1fr] gap-6 h-full min-h-0 p-4">
      {/* Left — Frame Visual */}
      <div className="flex flex-col gap-3 min-w-0">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
          {frame.thumbnailUrl ? (
            <img src={frame.thumbnailUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Icon className="h-12 w-12" />
              <span className="text-sm">Add visual</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Upload
          </Button>
          <Button size="sm" variant="outline" onClick={handleGenerate}>
            <Sparkles className="h-4 w-4 mr-1" /> Generate
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info("Asset browser coming soon")}>
            <FolderOpen className="h-4 w-4 mr-1" /> From Assets
          </Button>
        </div>
      </div>

      {/* Right — Frame Info */}
      <div className="flex flex-col gap-4 min-w-0 overflow-auto">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Frame {frameNum} of {totalFrames} · {FRAME_TYPE[frame.frameType]}
          </p>
          {editingName ? (
            <Input
              ref={nameRef}
              defaultValue={frame.visualDescription}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="text-base font-medium"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-left text-base font-medium hover:underline"
            >
              {frame.visualDescription || "Untitled frame"}
            </button>
          )}
        </div>

        <Section title="Shot">
          <p className="text-sm text-muted-foreground">{shotLabel}</p>
        </Section>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Duration</span>
          {editingDuration ? (
            <Input
              ref={durationRef}
              type="number"
              min={1}
              defaultValue={frame.durationSeconds}
              onBlur={handleDurationBlur}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-16 h-8 text-sm"
            />
          ) : (
            <button type="button" onClick={() => setEditingDuration(true)} className="text-sm hover:underline">
              {frame.durationSeconds}s
            </button>
          )}
        </div>

        <Section title="Script">
          <div className="space-y-1 text-sm text-muted-foreground">
            {(frame.voiceoverText || frame.dialogue) && <p><span className="text-foreground/80">VO/Dialogue:</span> {(frame.voiceoverText || frame.dialogue)?.slice(0, 80)}{((frame.voiceoverText || frame.dialogue)?.length ?? 0) > 80 ? "…" : ""}</p>}
            {frame.soundEffects && <p><span className="text-foreground/80">SFX:</span> {frame.soundEffects}</p>}
            {frame.musicNotes && <p><span className="text-foreground/80">Music:</span> {frame.musicNotes}</p>}
            {!frame.voiceoverText && !frame.dialogue && !frame.soundEffects && !frame.musicNotes && <p>—</p>}
          </div>
        </Section>
        <Section title="Production">
          {onLinkTask != null && onCreateTask != null && onLinkWorkflow != null && onLinkAsset != null ? (
            <ProductionBridge
              frame={frame}
              storyboard={storyboard}
              onLinkTask={onLinkTask}
              onCreateTask={onCreateTask}
              onLinkWorkflow={onLinkWorkflow}
              onLinkAsset={onLinkAsset}
            />
          ) : (
            <div className="space-y-1 text-sm text-muted-foreground">
              {frame.linkedTaskId && <p>Task linked</p>}
              {frame.linkedWorkflowId && <p>Workflow linked</p>}
              <p>Assets: {frame.linkedAssetIds?.length ?? 0} attached</p>
              <p>Status: <StatusDot status={genStatus} /> {genStatus.replace("_", " ")}</p>
            </div>
          )}
        </Section>

        <div className="flex gap-2 mt-auto pt-2">
          <Button size="sm" onClick={onOpenEditor}><Pencil className="h-4 w-4 mr-1" /> Edit Frame</Button>
          <Button size="sm" variant="outline" onClick={onOpenComments}><MessageCircle className="h-4 w-4 mr-1" /> {frame.commentCount} Comments</Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">{children}</div>
    </div>
  );
}
function StatusDot({ status }: { status: string }) {
  const color = status === "approved" || status === "generated" ? "bg-emerald-500" : status === "in_progress" ? "bg-blue-500" : "bg-muted-foreground";
  return <span className={cn("inline-block w-2 h-2 rounded-full", color)} />;
}

export function FrameDetailEmpty() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
      <Film className="h-14 w-14 opacity-50" />
      <p className="text-sm text-center">Select a frame from the timeline below to view details</p>
    </div>
  );
}
