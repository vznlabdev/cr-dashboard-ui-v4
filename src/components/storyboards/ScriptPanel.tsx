"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { FileText, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { StoryboardFrame } from "@/types/storyboard";

const READ_TIME_WPM = 150;
const WORDS_PER_MIN_TO_SEC = 60 / READ_TIME_WPM;

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** Parse full script into blocks by [SCENE N] or double newlines. */
function parseScriptToBlocks(script: string): string[] {
  const normalized = script.trim();
  if (!normalized) return [];
  const byScene = normalized.split(/\n\s*\[SCENE\s*\d*\]\s*\n/i).map((s) => s.trim()).filter(Boolean);
  if (byScene.length > 1) return byScene;
  return normalized.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

export interface ScriptPanelProps {
  frames: StoryboardFrame[];
  selectedFrameId: string | null;
  onUpdateFrame: (frameId: string, updates: Partial<StoryboardFrame>) => void;
  onSelectFrame: (frameId: string) => void;
  fullScript?: string;
  onUpdateFullScript?: (script: string) => void;
  onClose?: () => void;
}

export function ScriptPanel({
  frames,
  selectedFrameId,
  onUpdateFrame,
  onSelectFrame,
  fullScript = "",
  onUpdateFullScript,
  onClose,
}: ScriptPanelProps) {
  const [fullScriptOpen, setFullScriptOpen] = useState(true);
  const [localFullScript, setLocalFullScript] = useState(fullScript);
  const orderedFrames = useMemo(() => [...frames].sort((a, b) => a.order - b.order), [frames]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    setLocalFullScript((prev) => (fullScript !== undefined && fullScript !== prev ? fullScript : prev));
  }, [fullScript]);

  const totalWords = useMemo(() => {
    if (localFullScript.trim()) return wordCount(localFullScript);
    return orderedFrames.reduce(
      (sum, f) =>
        sum +
        wordCount(f.voiceoverText ?? "") +
        wordCount(f.dialogue ?? "") +
        wordCount(f.soundEffects ?? "") +
        wordCount(f.musicNotes ?? ""),
      0
    );
  }, [orderedFrames, localFullScript]);

  const readTimeSec = useMemo(
    () => Math.round(totalWords * WORDS_PER_MIN_TO_SEC),
    [totalWords]
  );

  const handleSyncFullToFrames = () => {
    const blocks = parseScriptToBlocks(localFullScript);
    orderedFrames.forEach((frame, i) => {
      const text = blocks[i] ?? "";
      const lines = text.split("\n").filter(Boolean);
      let vo = "";
      let sfx = "";
      let music = "";
      lines.forEach((line) => {
        const upper = line.toUpperCase();
        if (upper.startsWith("[SFX]")) sfx = line.replace(/^\[SFX\]\s*/i, "").trim();
        else if (upper.startsWith("[MUSIC]")) music = line.replace(/^\[MUSIC\]\s*/i, "").trim();
        else vo = vo ? `${vo}\n${line}` : line;
      });
      onUpdateFrame(frame.id, {
        voiceoverText: vo || undefined,
        dialogue: vo || undefined,
        soundEffects: sfx || undefined,
        musicNotes: music || undefined,
      });
    });
  };

  const handleSyncFramesToFull = () => {
    const text = orderedFrames.map((f, i) => {
      const parts = [
        f.voiceoverText || f.dialogue,
        f.soundEffects ? `[SFX] ${f.soundEffects}` : "",
        f.musicNotes ? `[MUSIC] ${f.musicNotes}` : "",
      ].filter(Boolean);
      return `[SCENE ${i + 1}]\n${parts.join("\n")}`;
    }).join("\n\n");
    setLocalFullScript(text);
    onUpdateFullScript?.(text);
  };

  useEffect(() => {
    if (selectedFrameId && sectionRefs.current[selectedFrameId]) {
      sectionRefs.current[selectedFrameId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedFrameId]);

  const handleKeyDown = (e: React.KeyboardEvent, frameIndex: number) => {
    if (e.key !== "Tab") return;
    const nextIndex = e.shiftKey ? frameIndex - 1 : frameIndex + 1;
    if (nextIndex < 0 || nextIndex >= orderedFrames.length) return;
    const nextFrame = orderedFrames[nextIndex];
    const el = textareaRefs.current[nextFrame.id];
    if (el) {
      e.preventDefault();
      el.focus();
    }
  };

  return (
    <div className="flex flex-col h-full w-80 min-w-0 border-l border-border bg-card">
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">Script</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={handleSyncFramesToFull}
            title="Frames → Full script"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <p className="shrink-0 px-4 py-1.5 text-xs text-muted-foreground border-b border-border/60">
        Total: {totalWords} words · ~{readTimeSec}s read time
      </p>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {orderedFrames.map((frame, i) => (
          <div
            key={frame.id}
            ref={(el) => { sectionRefs.current[frame.id] = el; }}
            className={cn(
              "rounded-lg border p-3 transition-colors",
              selectedFrameId === frame.id
                ? "border-primary bg-primary/5"
                : "border-border/60 hover:border-border"
            )}
          >
            <button
              type="button"
              className="w-full text-left mb-2"
              onClick={() => onSelectFrame(frame.id)}
            >
              <span className="text-xs font-medium text-muted-foreground">
                FRAME {i + 1}
                {frame.visualDescription ? ` · ${frame.visualDescription.slice(0, 28)}${(frame.visualDescription.length ?? 0) > 28 ? "…" : ""}` : ""}
              </span>
            </button>
            <div className="space-y-1.5">
              <Textarea
                ref={(el) => { textareaRefs.current[frame.id] = el; }}
                placeholder="[VO] / dialogue..."
                value={frame.voiceoverText ?? frame.dialogue ?? ""}
                onChange={(e) =>
                  onUpdateFrame(frame.id, {
                    voiceoverText: e.target.value,
                    dialogue: e.target.value,
                  })
                }
                onFocus={() => onSelectFrame(frame.id)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="min-h-[60px] resize-none text-sm"
              />
              <input
                type="text"
                placeholder="[SFX]"
                value={frame.soundEffects ?? ""}
                onChange={(e) => onUpdateFrame(frame.id, { soundEffects: e.target.value })}
                onFocus={() => onSelectFrame(frame.id)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground"
              />
              <input
                type="text"
                placeholder="[MUSIC]"
                value={frame.musicNotes ?? ""}
                onChange={(e) => onUpdateFrame(frame.id, { musicNotes: e.target.value })}
                onFocus={() => onSelectFrame(frame.id)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground"
              />
            </div>
          </div>
        ))}
      </div>

      <Collapsible open={fullScriptOpen} onOpenChange={setFullScriptOpen} className="shrink-0 border-t border-border">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium hover:bg-muted/30">
          Full Script (Free Write)
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            <Textarea
              placeholder="Write or paste full script here. Use [SCENE] markers to auto-sync with frames."
              value={localFullScript}
              onChange={(e) => {
                setLocalFullScript(e.target.value);
                onUpdateFullScript?.(e.target.value);
              }}
              className="min-h-[120px] resize-none text-sm"
            />
            <Button size="sm" variant="outline" className="w-full" onClick={handleSyncFullToFrames}>
              Sync Script → Frames
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Parses [SCENE] markers and paragraph breaks, distributes text to frame dialogue/VO.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
