"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Film,
  Type,
  ArrowLeftRight,
  Music,
  Image,
  Plus,
  Play,
  Pause,
  Volume2,
  Check,
  Circle,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { StoryboardAct, StoryboardFrame, FrameType } from "@/types/storyboard";

const CARD_WIDTH_BASE = 120;
const CARD_WIDTH_MIN = 80;
const CARD_WIDTH_MAX = 180;

const FRAME_TYPE_ICONS: Record<FrameType, typeof Film> = {
  scene: Film,
  title_card: Type,
  transition: ArrowLeftRight,
  audio_only: Music,
  b_roll: Image,
};

const FRAME_TYPE_LABELS: Record<FrameType, string> = {
  scene: "Scene",
  title_card: "Title Card",
  transition: "Transition",
  audio_only: "Audio Only",
  b_roll: "B-Roll",
};

const ADD_FRAME_TYPES: FrameType[] = ["scene", "title_card", "transition", "b_roll"];

export interface TimelineStripProps {
  frames: StoryboardFrame[];
  acts: StoryboardAct[];
  selectedFrameId: string | null;
  zoom: number;
  onSelectFrame: (frameId: string) => void;
  onReorderFrame: (frameId: string, newIndex: number) => void;
  onAddFrame: (afterFrameId?: string, frameType?: FrameType) => void;
  onDeleteFrame: (frameId: string) => void;
  /** Playback (optional – for playback bar) */
  isPlaying?: boolean;
  playbackPosition?: number;
  onPlayPause?: () => void;
  onZoomChange?: (zoom: number) => void;
  /** Show script / audio lanes */
  showScriptLane?: boolean;
  showAudioLane?: boolean;
}

function getFrameStatus(
  frame: StoryboardFrame
): "approved" | "generated" | "not_started" | "needs_revision" {
  if (frame.approvalStatus === "approved") return "approved";
  if (frame.approvalStatus === "needs_revision") return "needs_revision";
  if (
    frame.generationStatus === "generated" ||
    frame.generationStatus === "approved" ||
    frame.generationStatus === "in_progress"
  )
    return "generated";
  return "not_started";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimelineStrip({
  frames,
  acts,
  selectedFrameId,
  zoom,
  onSelectFrame,
  onReorderFrame,
  onAddFrame,
  onDeleteFrame,
  isPlaying = false,
  playbackPosition = 0,
  onPlayPause,
  onZoomChange,
  showScriptLane = true,
  showAudioLane = true,
}: TimelineStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredGapAfter, setHoveredGapAfter] = useState<string | "__start" | "__end" | null>(null);
  const GAP_WIDTH = 24;

  const orderedFrames = useMemo(
    () => [...frames].sort((a, b) => a.order - b.order),
    [frames]
  );

  const totalDuration = useMemo(
    () => orderedFrames.reduce((s, f) => s + f.durationSeconds, 0),
    [orderedFrames]
  );

  const frameIdToAct = useMemo(() => {
    const map = new Map<string, StoryboardAct>();
    const byOrder = [...acts].sort((a, b) => a.order - b.order);
    byOrder.forEach((act) => {
      act.frameIds.forEach((fid) => map.set(fid, act));
    });
    return map;
  }, [acts]);

  const actBreaks = useMemo(() => {
    if (acts.length === 0) return new Set<number>();
    const set = new Set<number>();
    let lastActId: string | null = null;
    orderedFrames.forEach((f, i) => {
      const act = frameIdToAct.get(f.id);
      const actId = act?.id ?? null;
      if (lastActId !== null && actId !== lastActId) set.add(i);
      lastActId = actId;
    });
    return set;
  }, [orderedFrames, frameIdToAct, acts.length]);

  const cardWidth = Math.min(
    CARD_WIDTH_MAX,
    Math.max(CARD_WIDTH_MIN, CARD_WIDTH_BASE * zoom)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const overId = over.id as string;
      const newIndex = orderedFrames.findIndex((f) => f.id === overId);
      if (newIndex === -1) return;
      onReorderFrame(active.id as string, newIndex);
    },
    [orderedFrames, onReorderFrame]
  );

  useEffect(() => {
    if (!selectedFrameId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(
      `[data-frame-id="${selectedFrameId}"]`
    ) as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedFrameId]);

  const sortableIds = useMemo(() => orderedFrames.map((f) => f.id), [orderedFrames]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden min-h-0"
        >
          <div className="inline-flex flex-col gap-0 p-3 min-w-full">
            {/* Act headers row */}
            {acts.length > 0 && (
              <div className="flex items-center gap-0 mb-1 shrink-0">
                {orderedFrames.map((frame, i) => {
                  const act = frameIdToAct.get(frame.id);
                  const showActHeader = actBreaks.has(i) || (i === 0 && act);
                  const actLabel =
                    act && showActHeader
                      ? `${act.name} · ${act.frameIds.length} frames`
                      : null;
                  return (
                    <div
                      key={frame.id}
                      className="shrink-0 flex items-center"
                      style={{
                        width: cardWidth,
                        marginRight: i < orderedFrames.length - 1 ? 8 : 0,
                      }}
                    >
                      {actLabel && (
                        <div
                          className="text-[10px] font-medium text-muted-foreground truncate px-1 rounded py-0.5 border border-border"
                          style={{
                            borderLeftColor: act?.color ?? "var(--border)",
                            borderLeftWidth: 3,
                          }}
                        >
                          {actLabel}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Frames row: [gap] [card1] [gap] [card2] ... [gap] [cardN] [+ Frame] */}
            <div
              className="flex items-center gap-0 shrink-0"
              onMouseLeave={() => setHoveredGapAfter(null)}
            >
              <SortableContext
                items={sortableIds}
                strategy={horizontalListSortingStrategy}
              >
                {orderedFrames.map((frame, i) => (
                  <div key={frame.id} className="flex items-center gap-0 shrink-0">
                    <GapSlot
                      width={GAP_WIDTH}
                      visible={hoveredGapAfter === (i === 0 ? "__start" : orderedFrames[i - 1].id)}
                      onAdd={(ft) =>
                        i === 0 ? onAddFrame(undefined, ft) : onAddFrame(orderedFrames[i - 1].id, ft)
                      }
                      onHover={(h) =>
                        setHoveredGapAfter(h ? (i === 0 ? "__start" : orderedFrames[i - 1].id) : null)
                      }
                    />
                    <SortableFrameCard
                      frame={frame}
                      index={i}
                      cardWidth={cardWidth}
                      isSelected={selectedFrameId === frame.id}
                      onSelect={() => onSelectFrame(frame.id)}
                      onDelete={onDeleteFrame}
                    />
                  </div>
                ))}
                <EndAddSlot
                  cardWidth={cardWidth}
                  gapWidth={GAP_WIDTH}
                  onAdd={(ft) =>
                    onAddFrame(orderedFrames[orderedFrames.length - 1]?.id, ft)
                  }
                  onHover={(h) => setHoveredGapAfter(h ? "__end" : null)}
                  visible={hoveredGapAfter === "__end" || orderedFrames.length === 0}
                  empty={orderedFrames.length === 0}
                />
              </SortableContext>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            (() => {
              const frame = orderedFrames.find((f) => f.id === activeId);
              if (!frame) return null;
              return (
                <FrameCardStatic
                  frame={frame}
                  index={orderedFrames.findIndex((f) => f.id === activeId)}
                  cardWidth={cardWidth}
                  isSelected
                />
              );
            })()
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Script lane — same gap/card layout as frames row */}
      {showScriptLane && (
        <div className="shrink-0 border-t border-border/50 px-3 py-1.5 bg-muted/20">
          <div className="text-[10px] font-medium text-muted-foreground mb-1">Script</div>
          <div className="flex gap-0 overflow-x-auto pb-1">
            {orderedFrames.length > 0 && <div style={{ width: GAP_WIDTH }} className="shrink-0" />}
            {orderedFrames.map((frame) => (
              <div key={frame.id} className="flex gap-0 shrink-0">
                <div style={{ width: GAP_WIDTH }} className="shrink-0" />
                <button
                  type="button"
                  onClick={() => onSelectFrame(frame.id)}
                  className="shrink-0 text-left text-xs text-muted-foreground hover:text-foreground truncate px-1"
                  style={{ width: cardWidth, minWidth: cardWidth }}
                >
                  {(frame.dialogue || frame.voiceoverText || "—").slice(0, 30)}
                  {(frame.dialogue?.length ?? frame.voiceoverText?.length ?? 0) > 30
                    ? "…"
                    : ""}
                </button>
              </div>
            ))}
            <div style={{ width: GAP_WIDTH }} className="shrink-0" />
          </div>
        </div>
      )}

      {/* Audio lane — same gap/card layout */}
      {showAudioLane && (
        <div className="shrink-0 border-t border-border/50 px-3 py-1.5 bg-muted/10">
          <div className="text-[10px] font-medium text-muted-foreground mb-1">Audio</div>
          <div className="flex gap-0 overflow-x-auto pb-1">
            {orderedFrames.length > 0 && <div style={{ width: GAP_WIDTH }} className="shrink-0" />}
            {orderedFrames.map((frame) => {
              const notes = frame.musicNotes ?? "—";
              const len = notes.length;
              const intensity =
                len > 20 ? "text-violet-600" : len > 10 ? "text-blue-600" : "text-muted-foreground";
              return (
                <div key={frame.id} className="flex gap-0 shrink-0">
                  <div style={{ width: GAP_WIDTH }} className="shrink-0" />
                  <button
                    type="button"
                    onClick={() => onSelectFrame(frame.id)}
                    className={cn(
                      "shrink-0 text-left text-[11px] truncate px-1",
                      intensity
                    )}
                    style={{ width: cardWidth, minWidth: cardWidth }}
                  >
                    {notes.slice(0, 25)}
                    {notes.length > 25 ? "…" : ""}
                  </button>
                </div>
              );
            })}
            <div style={{ width: GAP_WIDTH }} className="shrink-0" />
          </div>
        </div>
      )}

      {/* Playback bar */}
      <div className="shrink-0 border-t border-border px-3 py-2 flex items-center gap-3 bg-muted/10">
        {onPlayPause && (
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPlayPause}>
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatTime(playbackPosition)} / {formatTime(totalDuration)}
        </span>
        <span className="text-muted-foreground" title="Volume (placeholder)">
          <Volume2 className="h-4 w-4" />
        </span>
        {onZoomChange && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-muted-foreground">Zoom</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.25}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-20 h-1.5 accent-primary"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onZoomChange(Math.min(2, zoom + 0.25))}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function GapSlot({
  width,
  visible,
  onAdd,
  onHover,
}: {
  width: number;
  visible: boolean;
  onAdd: (ft: FrameType) => void;
  onHover: (hover: boolean) => void;
}) {
  return (
    <div
      className="shrink-0 flex items-center justify-center transition-opacity"
      style={{ width }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {visible && <AddFrameButton onAdd={onAdd} label="+" />}
    </div>
  );
}

function EndAddSlot({
  cardWidth,
  gapWidth,
  onAdd,
  onHover,
  visible,
  empty,
}: {
  cardWidth: number;
  gapWidth: number;
  onAdd: (ft: FrameType) => void;
  onHover: (hover: boolean) => void;
  visible: boolean;
  empty?: boolean;
}) {
  return (
    <div
      className="shrink-0 flex items-center justify-center ml-1"
      style={{ width: empty ? cardWidth : gapWidth }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {(visible || empty) && (
        <AddFrameButton onAdd={onAdd} label="+ Frame" />
      )}
    </div>
  );
}

function AddFrameButton({
  onAdd,
  label,
}: {
  onAdd: (ft: FrameType) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed text-muted-foreground hover:text-foreground"
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="grid gap-0.5">
          {ADD_FRAME_TYPES.map((ft) => (
            <Button
              key={ft}
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                onAdd(ft);
                setOpen(false);
              }}
            >
              {FRAME_TYPE_LABELS[ft]}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SortableFrameCard({
  frame,
  index,
  cardWidth,
  isSelected,
  onSelect,
  onDelete,
}: {
  frame: StoryboardFrame;
  index: number;
  cardWidth: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (frameId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: frame.id });

  const style = {
    width: cardWidth,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("shrink-0", isDragging && "opacity-50")}
    >
      <div
        data-frame-id={frame.id}
        {...attributes}
        {...listeners}
        className={cn(
          "rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing",
          "transition-all duration-150",
          isSelected
            ? "ring-2 ring-primary ring-offset-2 scale-[1.02]"
            : "hover:ring-1 hover:ring-border"
        )}
      >
        <FrameCardContent frame={frame} index={index} cardWidth={cardWidth} />
      </div>
    </div>
  );
}

function FrameCardStatic({
  frame,
  index,
  cardWidth,
  isSelected,
}: {
  frame: StoryboardFrame;
  index: number;
  cardWidth: number;
  isSelected: boolean;
}) {
  return (
    <div
      style={{ width: cardWidth }}
      className={cn(
        "shrink-0 rounded-lg border overflow-hidden shadow-lg",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <FrameCardContent frame={frame} index={index} cardWidth={cardWidth} />
    </div>
  );
}

function FrameCardContent({
  frame,
  index,
  cardWidth,
}: {
  frame: StoryboardFrame;
  index: number;
  cardWidth: number;
}) {
  const status = getFrameStatus(frame);
  const Icon = FRAME_TYPE_ICONS[frame.frameType] ?? Film;
  const aspect = 16 / 9;
  const height = cardWidth / aspect;

  return (
    <div className="bg-card">
      <div
        className="relative flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        {frame.thumbnailUrl ? (
          <img
            src={frame.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center"
            style={{ backgroundColor: frame.backgroundColor }}
          >
            <Icon className="h-8 w-8 shrink-0" />
          </div>
        )}
        <span className="absolute top-1 left-1 text-[10px] font-medium bg-black/50 text-white rounded px-1">
          {index + 1}
        </span>
      </div>
      <div className="flex items-center justify-between px-1.5 py-1 bg-muted/30">
        <span className="text-[10px] text-muted-foreground">
          {frame.durationSeconds}s
        </span>
        <span className="text-[10px]" title={status}>
          {status === "approved" && (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          )}
          {status === "generated" && (
            <Circle className="h-3 w-3 text-blue-500 fill-blue-500" />
          )}
          {status === "not_started" && (
            <Circle className="h-3 w-3 text-muted-foreground" />
          )}
          {status === "needs_revision" && (
            <Circle className="h-3 w-3 text-amber-500 fill-amber-500" />
          )}
        </span>
      </div>
    </div>
  );
}
