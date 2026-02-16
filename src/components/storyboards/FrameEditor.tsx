"use client";

import { useMemo, useRef } from "react";
import {
  ChevronDown,
  Upload,
  Sparkles,
  FolderOpen,
  Copy,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  Storyboard,
  StoryboardFrame,
  ShotType,
  CameraMovement,
  FrameType,
} from "@/types/storyboard";
import type { WhitelistedTool } from "@/types/workflow-builder";

const FRAME_TYPE_LABELS: Record<FrameType, string> = {
  scene: "Scene",
  title_card: "Title Card",
  transition: "Transition",
  audio_only: "Audio Only",
  b_roll: "B-Roll",
};

const SHOT_OPTIONS: { value: ShotType; label: string }[] = [
  { value: "wide", label: "Wide" },
  { value: "medium", label: "Medium" },
  { value: "close_up", label: "Close-up" },
  { value: "extreme_close_up", label: "Extreme close-up" },
  { value: "over_shoulder", label: "Over shoulder" },
  { value: "pov", label: "POV" },
  { value: "aerial", label: "Aerial" },
  { value: "tracking", label: "Tracking" },
  { value: "static", label: "Static" },
  { value: "custom", label: "Custom" },
];

const CAMERA_OPTIONS: { value: CameraMovement; label: string }[] = [
  { value: "static", label: "Static" },
  { value: "pan_left", label: "Pan left" },
  { value: "pan_right", label: "Pan right" },
  { value: "tilt_up", label: "Tilt up" },
  { value: "tilt_down", label: "Tilt down" },
  { value: "zoom_in", label: "Zoom in" },
  { value: "zoom_out", label: "Zoom out" },
  { value: "dolly_in", label: "Dolly in" },
  { value: "dolly_out", label: "Dolly out" },
  { value: "handheld", label: "Handheld" },
  { value: "orbit", label: "Orbit" },
  { value: "tracking", label: "Tracking" },
  { value: "none", label: "None" },
];

const TRANSITION_OPTIONS = ["cut", "fade", "dissolve", "wipe", "none"];
const APPROVAL_OPTIONS = ["draft", "pending_review", "approved", "needs_revision"] as const;
const GEN_STATUS_OPTIONS = ["not_started", "in_progress", "generated", "approved"] as const;

export interface FrameEditorProps {
  frame: StoryboardFrame;
  storyboard: Storyboard;
  onChange: (updates: Partial<StoryboardFrame>) => void;
  onClose: () => void;
  availableTools: WhitelistedTool[];
  /** Optional: create a task from this frame (title, description, project, workflow). Returns new task id. */
  onCreateTaskFromFrame?: () => void | Promise<string | undefined>;
  onDeleteFrame?: () => void;
}

export function FrameEditor({
  frame,
  storyboard,
  onChange,
  onClose,
  availableTools,
  onCreateTaskFromFrame,
  onDeleteFrame,
}: FrameEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frameIndex = storyboard.frames.findIndex((f) => f.id === frame.id);
  const startTime = useMemo(() => {
    const sorted = [...storyboard.frames].sort((a, b) => a.order - b.order);
    let t = 0;
    for (const f of sorted) {
      if (f.id === frame.id) return t;
      t += f.durationSeconds;
    }
    return 0;
  }, [storyboard.frames, frame.id]);
  const endTime = startTime + frame.durationSeconds;

  const suggestedPrompt = useMemo(() => {
    const parts = [frame.visualDescription || "Scene"];
    if (frame.shotType) parts.push(frame.shotType.replace("_", " "));
    if (frame.cameraMovement && frame.cameraMovement !== "static") parts.push(frame.cameraMovement.replace("_", " "));
    if (storyboard.brandName) parts.push(storyboard.brandName);
    parts.push(`${storyboard.aspectRatio} --ar ${storyboard.aspectRatio.replace(":", ":")}`);
    return parts.join(", ");
  }, [frame.visualDescription, frame.shotType, frame.cameraMovement, storyboard.brandName, storyboard.aspectRatio]);

  const recommendedTool = useMemo(() => {
    if (frame.aiToolRecommendation) {
      const t = availableTools.find((x) => x.id === frame.aiToolRecommendation || x.name === frame.aiToolRecommendation);
      if (t) return t;
    }
    return availableTools[0];
  }, [availableTools, frame.aiToolRecommendation]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ thumbnailUrl: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const copyPrompt = () => {
    const text = frame.aiPromptSuggestion || suggestedPrompt;
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied to clipboard");
  };

  const section = (title: string, children: React.ReactNode, defaultOpen = true) => (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-border/60 last:border-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left text-sm font-medium">
        {title}
        <ChevronDown className="h-4 w-4 shrink-0 data-[state=open]:rotate-180 transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3">{children}</CollapsibleContent>
    </Collapsible>
  );

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[500px] max-w-[100vw] sm:max-w-[500px] flex flex-col p-0"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-base">
            Frame {frameIndex >= 0 ? frameIndex + 1 : "?"}: {frame.visualDescription?.slice(0, 30) || "Untitled"}
            {(frame.visualDescription?.length ?? 0) > 30 && "…"}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            {FRAME_TYPE_LABELS[frame.frameType]} · {frame.shotType?.replace("_", " ") ?? "—"} · {frame.cameraMovement?.replace("_", " ") ?? "—"}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {section(
            "Visual",
            <>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center mb-2">
                {frame.thumbnailUrl ? (
                  <img src={frame.thumbnailUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-sm text-muted-foreground">No image</span>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" /> Upload
                </Button>
                <Button size="sm" variant="outline" onClick={() => { onChange({ aiPromptSuggestion: suggestedPrompt }); copyPrompt(); }}>
                  <Sparkles className="h-4 w-4 mr-1" /> Generate
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Asset browser coming soon")}>
                  <FolderOpen className="h-4 w-4 mr-1" /> From Assets
                </Button>
              </div>
              <Label className="text-xs">Visual Description</Label>
              <Textarea
                value={frame.visualDescription}
                onChange={(e) => onChange({ visualDescription: e.target.value })}
                placeholder="Describe what the viewer sees..."
                className="min-h-[80px] mt-1"
              />
            </>
          )}

          {section(
            "Camera",
            <>
              <Label className="text-xs">Shot Type</Label>
              <Select value={frame.shotType ?? ""} onValueChange={(v) => onChange({ shotType: v as ShotType })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {SHOT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Label className="text-xs mt-2 block">Camera Movement</Label>
              <Select value={frame.cameraMovement ?? ""} onValueChange={(v) => onChange({ cameraMovement: v as CameraMovement })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {CAMERA_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Label className="text-xs mt-2 block">Transition In</Label>
              <Select value={frame.transitionIn ?? ""} onValueChange={(v) => onChange({ transitionIn: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {TRANSITION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              <Label className="text-xs mt-2 block">Transition Out</Label>
              <Select value={frame.transitionOut ?? ""} onValueChange={(v) => onChange({ transitionOut: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {TRANSITION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </>
          )}

          {section(
            "Script & Audio",
            <>
              <Label className="text-xs">Speaker</Label>
              <Input
                value={frame.speaker ?? ""}
                onChange={(e) => onChange({ speaker: e.target.value })}
                placeholder="VO"
                className="mt-1"
              />
              <Label className="text-xs mt-2 block">Dialogue / VO</Label>
              <Textarea
                value={frame.voiceoverText ?? frame.dialogue ?? ""}
                onChange={(e) => onChange({ voiceoverText: e.target.value, dialogue: e.target.value })}
                placeholder="Line or narration..."
                className="min-h-[60px] mt-1"
              />
              <Label className="text-xs mt-2 block">Sound Effects</Label>
              <Input
                value={frame.soundEffects ?? ""}
                onChange={(e) => onChange({ soundEffects: e.target.value })}
                placeholder="e.g. Lace tightening"
                className="mt-1"
              />
              <Label className="text-xs mt-2 block">Music Notes</Label>
              <Input
                value={frame.musicNotes ?? ""}
                onChange={(e) => onChange({ musicNotes: e.target.value })}
                placeholder="e.g. Beat building"
                className="mt-1"
              />
            </>
          )}

          {section(
            "Timing",
            <>
              <Label className="text-xs">Duration (seconds)</Label>
              <Input
                type="number"
                min={1}
                value={frame.durationSeconds}
                onChange={(e) => onChange({ durationSeconds: Number(e.target.value) || 1 })}
                className="mt-1 w-20"
              />
              <p className="text-xs text-muted-foreground mt-1">Timeline position: {startTime}s → {endTime}s</p>
            </>
          )}

          {section(
            "Production",
            <>
              <Label className="text-xs">Linked Task</Label>
              <Select
                value={frame.linkedTaskId ?? "_none"}
                onValueChange={(v) => {
                  if (v === "_create") {
                    onCreateTaskFromFrame?.();
                    toast.info("Create task from frame — task integration coming soon");
                  } else if (v !== "_none") onChange({ linkedTaskId: v });
                  else onChange({ linkedTaskId: undefined });
                }}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select or create..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Select or create...</SelectItem>
                  <SelectItem value="_create">Create task from frame</SelectItem>
                  {frame.linkedTaskId && <SelectItem value={frame.linkedTaskId}>Current task</SelectItem>}
                </SelectContent>
              </Select>
              <Label className="text-xs mt-2 block">Linked Workflow</Label>
              <Select value={frame.linkedWorkflowId ?? "_none"} onValueChange={(v) => onChange({ linkedWorkflowId: v === "_none" ? undefined : v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Select...</SelectItem>
                  <SelectItem value="wf-ai-image">AI Image Campaign</SelectItem>
                </SelectContent>
              </Select>
              <Label className="text-xs mt-2 block">Assets</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {frame.linkedAssetIds?.length ?? 0} linked. <Button type="button" variant="link" className="p-0 h-auto text-xs" onClick={() => toast.info("Asset browser coming soon")}>+ Link Asset</Button>
              </p>
              <Label className="text-xs mt-2 block">Generation Status</Label>
              <Select value={frame.generationStatus ?? "not_started"} onValueChange={(v) => onChange({ generationStatus: v as StoryboardFrame["generationStatus"] })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GEN_STATUS_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </>
          )}

          {section(
            "AI Assistant",
            <>
              <Label className="text-xs">Suggested Prompt</Label>
              <p className="text-xs text-muted-foreground mt-1 break-words bg-muted/30 rounded p-2">
                {frame.aiPromptSuggestion || suggestedPrompt}
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={copyPrompt}><Copy className="h-4 w-4 mr-1" /> Copy Prompt</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info(`Open in ${recommendedTool?.name ?? "tool"} — coming soon`)}>
                  Open in {recommendedTool?.name ?? "tool"} →
                </Button>
              </div>
              {recommendedTool && (
                <>
                  <Label className="text-xs mt-2 block">Recommended Tool</Label>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {recommendedTool.icon ? <ImageIcon className="h-3.5 w-3.5" /> : null} {recommendedTool.name} ✓ {recommendedTool.approvalStatus === "approved" ? "Approved" : recommendedTool.approvalStatus}
                  </p>
                </>
              )}
            </>
          )}

          {section(
            "Notes & Approval",
            <>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={frame.notes ?? ""}
                onChange={(e) => onChange({ notes: e.target.value })}
                placeholder="Production notes..."
                className="min-h-[60px] mt-1"
              />
              <Label className="text-xs mt-2 block">Approval</Label>
              <Select value={frame.approvalStatus} onValueChange={(v) => onChange({ approvalStatus: v as StoryboardFrame["approvalStatus"] })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPROVAL_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => toast.info("Request review sent")}>Request Review</Button>
            </>
          )}
        </div>

        <div className="shrink-0 border-t px-4 py-3 text-xs text-muted-foreground">
          <p>Version {frame.version} · Updated by {frame.updatedAt ? new Date(frame.updatedAt).toLocaleString() : "—"} {frame.createdBy}</p>
          {onDeleteFrame && (
            <Button size="sm" variant="ghost" className="text-destructive mt-2" onClick={onDeleteFrame}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete Frame
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
