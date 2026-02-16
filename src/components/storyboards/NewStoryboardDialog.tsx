"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Smartphone,
  Clapperboard,
  Film,
  BarChart3,
  Music,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  StoryboardFormat,
  StoryboardFrame,
  StoryboardAct,
} from "@/types/storyboard";
import { getAllProjects } from "@/lib/mock-data/projects-tasks";

const now = () => new Date().toISOString();
const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const FORMATS: { value: StoryboardFormat; label: string; hint: string; icon: typeof Film }[] = [
  { value: "short_form", label: "Short Form", hint: "<60s", icon: Smartphone },
  { value: "commercial", label: "Commercial", hint: "15-60s", icon: Clapperboard },
  { value: "brand_film", label: "Brand Film", hint: "1-5min", icon: Film },
  { value: "explainer", label: "Explainer", hint: "2-10min", icon: BarChart3 },
  { value: "music_video", label: "Music Video", hint: "", icon: Music },
  { value: "custom", label: "Custom", hint: "", icon: Settings },
];

const ASPECT_OPTIONS = ["16:9", "9:16", "1:1", "4:5", "4:3", "21:9"] as const;
const FORMAT_ASPECT: Record<StoryboardFormat, (typeof ASPECT_OPTIONS)[number]> = {
  short_form: "9:16",
  commercial: "16:9",
  brand_film: "16:9",
  explainer: "16:9",
  music_video: "16:9",
  presentation: "16:9",
  social_video: "16:9",
  custom: "16:9",
};

type StartWith = "blank" | "3act" | "product" | "testimonial" | "import";

export interface NewStoryboardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (storyboard: Storyboard) => void;
  preselectedProjectId?: string;
}

function makeFrame(
  storyboardId: string,
  order: number,
  overrides: Partial<StoryboardFrame> = {}
): StoryboardFrame {
  return {
    id: nextId("f"),
    storyboardId,
    order,
    frameType: "scene",
    visualDescription: "",
    durationSeconds: 3,
    linkedAssetIds: [],
    commentCount: 0,
    approvalStatus: "draft",
    createdAt: now(),
    updatedAt: now(),
    createdBy: "Current User",
    version: 1,
    ...overrides,
  };
}

function makeAct(id: string, name: string, order: number, frameIds: string[]): StoryboardAct {
  return { id, name, order, frameIds };
}

export function NewStoryboardDialog({
  isOpen,
  onClose,
  onCreated,
  preselectedProjectId,
}: NewStoryboardDialogProps) {
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<StoryboardFormat>("commercial");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_OPTIONS)[number]>("16:9");
  const [projectId, setProjectId] = useState<string>(preselectedProjectId ?? "");
  const [brandName, setBrandName] = useState("");
  const [targetDuration, setTargetDuration] = useState("");
  const [startWith, setStartWith] = useState<StartWith>("blank");
  const [importScript, setImportScript] = useState("");

  const projects = useMemo(() => getAllProjects(), []);

  useEffect(() => {
    if (isOpen) {
      setProjectId(preselectedProjectId ?? "");
      if (preselectedProjectId) {
        const p = projects.find((x) => x.id === preselectedProjectId);
        if (p) setBrandName(p.name);
      } else setBrandName("");
    }
  }, [isOpen, preselectedProjectId, projects]);

  const aspectOptions = ASPECT_OPTIONS.map((a) => ({ value: a, label: a }));

  const handleFormatChange = (f: StoryboardFormat) => {
    setFormat(f);
    setAspectRatio(FORMAT_ASPECT[f]);
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p && !brandName) setBrandName(p.name);
  };

  const parseImportScript = (text: string): { voiceoverText: string }[] => {
    const blocks = text
      .split(/\n\s*\n|\[SCENE\]/i)
      .map((s) => s.trim())
      .filter(Boolean);
    return blocks.map((voiceoverText) => ({ voiceoverText }));
  };

  const buildFramesAndActs = (
    storyboardId: string,
    startWithChoice: StartWith,
    scriptBlocks: { voiceoverText: string }[]
  ): { frames: StoryboardFrame[]; acts: StoryboardAct[] } => {
    if (startWithChoice === "import" && scriptBlocks.length > 0) {
      const frames = scriptBlocks.map((block, i) =>
        makeFrame(storyboardId, i, {
          voiceoverText: block.voiceoverText,
          visualDescription: block.voiceoverText.slice(0, 80) + (block.voiceoverText.length > 80 ? "…" : ""),
        })
      );
      return { frames, acts: [] };
    }
    if (startWithChoice === "blank") {
      return {
        frames: [makeFrame(storyboardId, 0)],
        acts: [],
      };
    }
    if (startWithChoice === "3act") {
      const f1 = makeFrame(storyboardId, 0, { visualDescription: "Hook — opening moment" });
      const f2 = makeFrame(storyboardId, 1, { visualDescription: "Body — main content" });
      const f3 = makeFrame(storyboardId, 2, { visualDescription: "CTA — call to action" });
      const frames = [f1, f2, f3];
      const act1 = makeAct(nextId("act"), "Act 1: Hook", 0, [f1.id]);
      const act2 = makeAct(nextId("act"), "Act 2: Body", 1, [f2.id]);
      const act3 = makeAct(nextId("act"), "Act 3: CTA", 2, [f3.id]);
      return { frames, acts: [act1, act2, act3] };
    }
    if (startWithChoice === "product") {
      const frames = Array.from({ length: 5 }, (_, i) =>
        makeFrame(storyboardId, i, {
          visualDescription: ["Hero shot", "Feature 1", "Feature 2", "Feature 3", "Close"][i],
        })
      );
      return { frames, acts: [] };
    }
    if (startWithChoice === "testimonial") {
      const frames = Array.from({ length: 4 }, (_, i) =>
        makeFrame(storyboardId, i, {
          visualDescription: ["Intro", "Problem", "Quote", "Outro"][i],
        })
      );
      return { frames, acts: [] };
    }
    return { frames: [makeFrame(storyboardId, 0)], acts: [] };
  };

  const handleCreate = () => {
    const storyboardId = nextId("sb");
    const scriptBlocks =
      startWith === "import" && importScript.trim()
        ? parseImportScript(importScript.trim())
        : [];
    const { frames, acts } = buildFramesAndActs(storyboardId, startWith, scriptBlocks);
    const totalDurationSeconds = frames.reduce((s, f) => s + f.durationSeconds, 0);
    const project = projects.find((p) => p.id === projectId);

    const storyboard: Storyboard = {
      id: storyboardId,
      title: title.trim() || "Untitled Storyboard",
      format,
      status: "draft",
      acts,
      frames,
      totalDurationSeconds,
      aspectRatio,
      projectId: projectId || undefined,
      projectName: project?.name,
      brandName: brandName || undefined,
      targetDurationSeconds: targetDuration ? Number(targetDuration) : undefined,
      collaborators: [],
      commentCount: 0,
      provenanceEnabled: false,
      aclarLinked: false,
      createdAt: now(),
      updatedAt: now(),
      createdBy: "Current User",
      version: 1,
    };

    onCreated(storyboard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Storyboard</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>Title</Label>
            <Input
              placeholder="Untitled Storyboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Format</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {FORMATS.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => handleFormatChange(f.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors",
                      format === f.value
                        ? "ring-2 ring-primary border-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{f.label}</span>
                    {f.hint && <span className="text-[10px] text-muted-foreground">{f.hint}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(v) => setAspectRatio(v as (typeof ASPECT_OPTIONS)[number])}
            >
              <SelectTrigger className="mt-1 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project</Label>
            <Select value={projectId || "_none"} onValueChange={(v) => handleProjectChange(v === "_none" ? "" : v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Select project...</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Brand (auto-fills from project)</Label>
            <Input
              placeholder="Brand name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Target Duration (optional)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={1}
                placeholder="30"
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
          </div>

          <div>
            <Label>Start with</Label>
            <div className="space-y-2 mt-1">
              {(
                [
                  { value: "blank" as const, label: "Blank storyboard (1 empty frame)" },
                  { value: "3act" as const, label: "Template: 3-Act Structure (Hook → Body → CTA)" },
                  { value: "product" as const, label: "Template: Product Showcase (5 frames)" },
                  { value: "testimonial" as const, label: "Template: Testimonial Short (4 frames)" },
                  { value: "import" as const, label: "Import script (paste text → auto-generate frames)" },
                ] as const
              ).map((o) => (
                <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="startWith"
                    checked={startWith === o.value}
                    onChange={() => setStartWith(o.value)}
                  />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </div>
            {startWith === "import" && (
              <textarea
                placeholder="Paste script here. Split by blank lines or [SCENE] markers."
                value={importScript}
                onChange={(e) => setImportScript(e.target.value)}
                className="mt-2 w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                rows={4}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Storyboard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
