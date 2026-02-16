"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Storyboard, StoryboardFrame } from "@/types/storyboard";

export interface AnimaticPlayerProps {
  storyboard: Storyboard;
  startFromFrameId?: string;
  onClose: () => void;
}

function getOrderedFrames(storyboard: Storyboard): StoryboardFrame[] {
  return [...storyboard.frames].sort((a, b) => a.order - b.order);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function AnimaticPlayer({
  storyboard,
  startFromFrameId,
  onClose,
}: AnimaticPlayerProps) {
  const orderedFrames = useMemo(() => getOrderedFrames(storyboard), [storyboard]);
  const totalDuration = useMemo(
    () => orderedFrames.reduce((sum, f) => sum + (f.durationSeconds ?? 3), 0),
    [orderedFrames]
  );

  const startIndex = useMemo(() => {
    if (!startFromFrameId) return 0;
    const i = orderedFrames.findIndex((f) => f.id === startFromFrameId);
    return i >= 0 ? i : 0;
  }, [orderedFrames, startFromFrameId]);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scriptVisible, setScriptVisible] = useState(true);
  const [elapsedInFrame, setElapsedInFrame] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const frame = orderedFrames[currentIndex];
  const frameDuration = frame?.durationSeconds ?? 3;
  const currentTime = useMemo(() => {
    let t = 0;
    for (let i = 0; i < currentIndex; i++) t += orderedFrames[i]?.durationSeconds ?? 3;
    return t + elapsedInFrame;
  }, [orderedFrames, currentIndex, elapsedInFrame]);

  const goToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, orderedFrames.length - 1));
      setCurrentIndex(clamped);
      setElapsedInFrame(0);
    },
    [orderedFrames.length]
  );

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < orderedFrames.length - 1) {
      goToIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
      setElapsedInFrame(0);
    }
  }, [currentIndex, orderedFrames.length, goToIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setElapsedInFrame((prev) => {
        const step = 0.1;
        const next = prev + step;
        if (next >= frameDuration) {
          if (currentIndex < orderedFrames.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentIndex((i) => i + 1);
              setElapsedInFrame(0);
              setIsTransitioning(false);
            }, transitionMs);
          } else {
            setIsPlaying(false);
          }
          return 0;
        }
        return Math.min(next, frameDuration);
      });
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isPlaying, frameDuration, currentIndex, orderedFrames.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    setCurrentIndex(startIndex);
    setElapsedInFrame(0);
  }, [startFromFrameId, startIndex]);

  const voText = frame?.voiceoverText ?? frame?.dialogue ?? "";
  const shotLabel = frame?.shotType?.replace("_", " ") ?? "—";
  const transitionMs = (frame?.transitionOut?.toLowerCase().includes("fade") ?? false) ? 200 : 80;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white"
      role="presentation"
    >
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 p-6">
        <div
          className={cn(
            "w-full max-w-5xl flex flex-col items-center justify-center transition-opacity duration-150",
            isTransitioning && "opacity-0"
          )}
        >
          {/* Frame image */}
          <div
            className="relative w-full flex items-center justify-center rounded-lg overflow-hidden bg-black/40"
            style={{ aspectRatio: storyboard.aspectRatio === "9:16" ? "9/16" : "16/9" }}
          >
            {frame?.thumbnailUrl ? (
              <img
                src={frame.thumbnailUrl}
                alt={frame.visualDescription || `Frame ${currentIndex + 1}`}
                className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
              />
            ) : (
              <div
                className="w-full h-full min-h-[200px] flex items-center justify-center text-white/40 text-sm"
                style={{
                  backgroundColor: frame?.backgroundColor ?? "rgba(255,255,255,0.05)",
                }}
              >
                {frame?.visualDescription || `Frame ${currentIndex + 1}`}
              </div>
            )}
          </div>

          {/* Script / VO (toggleable) */}
          {scriptVisible && voText && (
            <p className="mt-4 text-center text-lg text-white/90 max-w-2xl px-4 line-clamp-2">
              &ldquo;{voText}&rdquo;
            </p>
          )}

          {/* Frame info */}
          <p className="mt-2 text-sm text-white/60">
            Frame {currentIndex + 1} of {orderedFrames.length}
            {frame?.visualDescription && ` · ${frame.visualDescription.slice(0, 32)}${(frame.visualDescription.length ?? 0) > 32 ? "…" : ""}`}
            {shotLabel !== "—" && ` · ${shotLabel}`}
            {" · "}
            {frameDuration}s
          </p>
        </div>
      </div>

      {/* Mini frame strip */}
      <div className="shrink-0 px-6 pb-2 flex justify-center">
        <div className="flex gap-0.5" role="tablist" aria-label="Frame strip">
          {orderedFrames.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => goToIndex(i)}
              className={cn(
                "w-6 h-8 rounded-sm transition-colors",
                i < currentIndex && "bg-white/40",
                i === currentIndex && "bg-white",
                i > currentIndex && "bg-white/20 hover:bg-white/30"
              )}
              title={`Frame ${i + 1}: ${f.visualDescription?.slice(0, 30) ?? ""}`}
              aria-label={`Frame ${i + 1}`}
              aria-selected={i === currentIndex}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 flex items-center justify-center gap-4 px-6 py-4 border-t border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous frame"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 h-12 w-12"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 ml-0.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={goNext}
          disabled={currentIndex === orderedFrames.length - 1}
          aria-label="Next frame"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        <span className="text-sm text-white/70 tabular-nums min-w-[100px] text-center">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-white hover:bg-white/20",
            scriptVisible && "bg-white/10"
          )}
          onClick={() => setScriptVisible((v) => !v)}
          aria-label={scriptVisible ? "Hide script" : "Show script"}
        >
          <FileText className="h-4 w-4 mr-1" />
          Script {scriptVisible ? "On" : "Off"}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 ml-auto"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
