"use client";

import { useMemo, useState } from "react";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Film, Type, ArrowLeftRight, Music, Image, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoryboardAct, StoryboardFrame, FrameType } from "@/types/storyboard";

const FRAME_TYPE_ICONS: Record<FrameType, typeof Film> = {
  scene: Film,
  title_card: Type,
  transition: ArrowLeftRight,
  audio_only: Music,
  b_roll: Image,
};

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

export interface GridViewProps {
  frames: StoryboardFrame[];
  acts: StoryboardAct[];
  selectedFrameId: string | null;
  onSelectFrame: (frameId: string) => void;
  onReorderFrame: (frameId: string, newIndex: number) => void;
}

export function GridView({
  frames,
  acts,
  selectedFrameId,
  onSelectFrame,
  onReorderFrame,
}: GridViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const orderedFrames = useMemo(
    () => [...frames].sort((a, b) => a.order - b.order),
    [frames]
  );

  const frameIdToAct = useMemo(() => {
    const map = new Map<string, StoryboardAct>();
    const byOrder = [...acts].sort((a, b) => a.order - b.order);
    byOrder.forEach((act) => act.frameIds.forEach((fid) => map.set(fid, act)));
    return map;
  }, [acts]);

  const actGroups = useMemo(() => {
    if (acts.length === 0)
      return [{ act: null as StoryboardAct | null, frameIds: orderedFrames.map((f) => f.id) }];
    const byOrder = [...acts].sort((a, b) => a.order - b.order);
    const groups: { act: StoryboardAct | null; frameIds: string[] }[] = [];
    const assigned = new Set<string>();
    byOrder.forEach((act) => {
      const ids = act.frameIds.filter((id) => orderedFrames.some((f) => f.id === id));
      if (ids.length) {
        ids.forEach((id) => assigned.add(id));
        groups.push({ act, frameIds: ids });
      }
    });
    const unassigned = orderedFrames.filter((f) => !assigned.has(f.id)).map((f) => f.id);
    if (unassigned.length) groups.push({ act: null, frameIds: unassigned });
    return groups;
  }, [acts, orderedFrames]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const newIndex = orderedFrames.findIndex((f) => f.id === over.id);
    if (newIndex !== -1) onReorderFrame(active.id as string, newIndex);
  };

  const sortableIds = useMemo(() => orderedFrames.map((f) => f.id), [orderedFrames]);

  return (
    <div className="h-full overflow-auto p-4">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div className="space-y-6">
            {actGroups.map((group) => (
              <div key={group.act?.id ?? "ungrouped"}>
                {group.act && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {group.act.name}
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...group.frameIds]
                    .sort(
                      (a, b) =>
                        orderedFrames.findIndex((f) => f.id === a) -
                        orderedFrames.findIndex((f) => f.id === b)
                    )
                    .map((fid) => {
                    const frame = orderedFrames.find((f) => f.id === fid);
                    if (!frame) return null;
                    const index = orderedFrames.findIndex((f) => f.id === fid);
                    return (
                      <SortableGridCard
                        key={frame.id}
                        frame={frame}
                        index={index}
                        isSelected={selectedFrameId === frame.id}
                        onSelect={() => onSelectFrame(frame.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            (() => {
              const frame = orderedFrames.find((f) => f.id === activeId);
              if (!frame) return null;
              const index = orderedFrames.findIndex((f) => f.id === activeId);
              return (
                <GridCardContent
                  frame={frame}
                  index={index}
                  isSelected
                  className="opacity-95 shadow-lg cursor-grabbing"
                />
              );
            })()
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableGridCard({
  frame,
  index,
  isSelected,
  onSelect,
}: {
  frame: StoryboardFrame;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
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
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50")}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={cn(
          "w-full text-left rounded-xl border overflow-hidden transition-all",
          "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
          isSelected ? "ring-2 ring-primary border-primary" : "border-border bg-card"
        )}
      >
        <GridCardContent frame={frame} index={index} isSelected={isSelected} />
      </button>
    </div>
  );
}

function GridCardContent({
  frame,
  index,
  isSelected,
  className,
}: {
  frame: StoryboardFrame;
  index: number;
  isSelected: boolean;
  className?: string;
}) {
  const status = getFrameStatus(frame);
  const Icon = FRAME_TYPE_ICONS[frame.frameType] ?? Film;
  const firstLine = (frame.voiceoverText ?? frame.dialogue ?? "").slice(0, 40);
  const name = frame.visualDescription?.slice(0, 24) || "Untitled";
  const shot = frame.shotType?.replace("_", " ") ?? "—";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between px-2 py-1 bg-muted/50 border-b">
        <span className="text-xs font-medium">{index + 1}</span>
      </div>
      <div className="aspect-video bg-muted/30 flex items-center justify-center relative">
        {frame.thumbnailUrl ? (
          <img
            src={frame.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <div className="p-2 space-y-1">
        <p className="text-sm font-medium truncate" title={frame.visualDescription}>
          {name}{(frame.visualDescription?.length ?? 0) > 24 ? "…" : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {shot} · {frame.durationSeconds}s
        </p>
        {firstLine && (
          <p className="text-xs text-muted-foreground truncate">"{firstLine}{firstLine.length >= 40 ? "…" : ""}"</p>
        )}
        <p className="text-[10px] flex items-center gap-1">
          {status === "approved" && <Check className="h-3 w-3 text-emerald-600" />}
          {status === "generated" && <Circle className="h-2.5 w-2.5 text-blue-500 fill-blue-500" />}
          {status === "not_started" && <Circle className="h-2.5 w-2.5 text-muted-foreground" />}
          {status === "needs_revision" && <Circle className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />}
          <span className="capitalize">{status.replace("_", " ")}</span>
        </p>
      </div>
    </div>
  );
}
