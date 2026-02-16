"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Clapperboard, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StoryboardFrame } from "@/types/storyboard";

export interface StoryboardContextProps {
  storyboardId: string;
  storyboardTitle: string;
  frameId: string;
  frame: StoryboardFrame;
  /** All frames in order (for prev/next). */
  orderedFrames: StoryboardFrame[];
}

export function StoryboardContext({
  storyboardId,
  storyboardTitle,
  frameId,
  frame,
  orderedFrames,
}: StoryboardContextProps) {
  const [browseIndex, setBrowseIndex] = useState(() => {
    const i = orderedFrames.findIndex((f) => f.id === frameId);
    return i >= 0 ? i : 0;
  });

  const displayedFrame = useMemo(() => orderedFrames[browseIndex], [orderedFrames, browseIndex]);
  const currentIndex = orderedFrames.findIndex((f) => f.id === frameId);
  const canPrev = browseIndex > 0;
  const canNext = browseIndex < orderedFrames.length - 1;
  const frameNum = browseIndex + 1;
  const totalFrames = orderedFrames.length;

  const voSnippet = (displayedFrame?.voiceoverText ?? displayedFrame?.dialogue ?? "")
    .slice(0, 40);
  const shotLabel = displayedFrame?.shotType?.replace("_", " ") ?? "—";

  if (!displayedFrame) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clapperboard className="h-4 w-4 text-muted-foreground" />
          Storyboard Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium truncate" title={storyboardTitle}>
          {storyboardTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          Frame {frameNum} of {totalFrames}: &quot;{(displayedFrame.visualDescription || "Untitled").slice(0, 32)}
          {(displayedFrame.visualDescription?.length ?? 0) > 32 ? "…" : ""}&quot;
        </p>

        <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
          <div className="aspect-video flex items-center justify-center bg-muted/30 relative">
            {displayedFrame.thumbnailUrl ? (
              <img
                src={displayedFrame.thumbnailUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-sm text-muted-foreground">No image</span>
            )}
          </div>
          <div className="px-2 py-1.5 text-xs text-muted-foreground flex justify-between">
            <span>{shotLabel} · {displayedFrame.durationSeconds}s</span>
          </div>
          {voSnippet && (
            <div className="px-2 pb-2 text-xs text-muted-foreground border-t border-border/60 pt-1.5">
              VO: &quot;{voSnippet}{((displayedFrame.voiceoverText ?? displayedFrame.dialogue)?.length ?? 0) > 40 ? "…" : ""}&quot;
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="default" className="h-8" asChild>
            <Link href={`/storyboards/${storyboardId}`}>
              Open Storyboard <ExternalLink className="h-3.5 w-3 ml-1" />
            </Link>
          </Button>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              disabled={!canPrev}
              onClick={() => setBrowseIndex((i) => Math.max(0, i - 1))}
              aria-label="Previous frame"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              disabled={!canNext}
              onClick={() => setBrowseIndex((i) => Math.min(orderedFrames.length - 1, i + 1))}
              aria-label="Next frame"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
