"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StoryboardAct, StoryboardFrame, FrameType } from "@/types/storyboard";

const FRAME_TYPE_LABELS: Record<FrameType, string> = {
  scene: "Scene",
  title_card: "Title",
  transition: "Trans",
  audio_only: "Audio",
  b_roll: "B-Roll",
};

const GEN_STATUS_LABELS: Record<string, string> = {
  not_started: "—",
  in_progress: "In Prog",
  generated: "Generated",
  approved: "Approved",
};

function getStatusDisplay(frame: StoryboardFrame): string {
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

type SortKey = "order" | "visualDescription" | "frameType" | "shotType" | "durationSeconds" | "script" | "status" | "linkedTaskId";

export interface ListViewProps {
  frames: StoryboardFrame[];
  acts: StoryboardAct[];
  selectedFrameId: string | null;
  onSelectFrame: (frameId: string) => void;
  onReorderFrame?: (frameId: string, newIndex: number) => void;
  onUpdateFrame: (frameId: string, updates: Partial<StoryboardFrame>) => void;
}

export function ListView({
  frames,
  selectedFrameId,
  onSelectFrame,
  onUpdateFrame,
}: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ frameId: string; key: string } | null>(null);

  const orderedFrames = useMemo(() => {
    const list = [...frames].sort((a, b) => a.order - b.order);
    const getVal = (f: StoryboardFrame, key: SortKey) => {
      switch (key) {
        case "order": return f.order;
        case "visualDescription": return (f.visualDescription ?? "").toLowerCase();
        case "frameType": return f.frameType;
        case "shotType": return (f.shotType ?? "").toLowerCase();
        case "durationSeconds": return f.durationSeconds;
        case "script": return (f.voiceoverText ?? f.dialogue ?? "").toLowerCase();
        case "status": return getStatusDisplay(f);
        case "linkedTaskId": return (f.linkedTaskId ?? "").toLowerCase();
        default: return "";
      }
    };
    list.sort((a, b) => {
      const va = getVal(a, sortKey);
      const vb = getVal(b, sortKey);
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [frames, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orderedFrames.length)
      setSelectedIds(new Set());
    else
      setSelectedIds(new Set(orderedFrames.map((f) => f.id)));
  };

  const bulkApprove = () => {
    selectedIds.forEach((frameId) =>
      onUpdateFrame(frameId, { approvalStatus: "approved" })
    );
    setSelectedIds(new Set());
  };

  return (
    <div className="h-full overflow-auto">
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={bulkApprove}>
            Approve all
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-8 px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === orderedFrames.length && orderedFrames.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSort("order")}
              >
                <span className="inline-flex items-center gap-1"># {sortKey === "order" ? (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}</span>
              </th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("visualDescription")}>
                Frame {sortKey === "visualDescription" && (sortDir === "asc" ? <ArrowUp className="inline h-3.5 w-3.5" /> : <ArrowDown className="inline h-3.5 w-3.5" />)}
              </th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("frameType")}>
                Type
              </th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("shotType")}>
                Shot
              </th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("durationSeconds")}>
                Duration
              </th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50 min-w-[120px]" onClick={() => toggleSort("script")}>
                Script
              </th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("status")}>
                Status
              </th>
              <th className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("linkedTaskId")}>
                Task
              </th>
            </tr>
          </thead>
          <tbody>
            {orderedFrames.map((frame, i) => (
              <tr
                key={frame.id}
                className={cn(
                  "border-b border-border/60 hover:bg-muted/20",
                  selectedFrameId === frame.id && "bg-primary/5"
                )}
                onClick={() => onSelectFrame(frame.id)}
              >
                <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(frame.id)}
                    onChange={() => toggleSelect(frame.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-1.5 font-medium max-w-[140px] truncate" title={frame.visualDescription}>
                  {frame.visualDescription?.slice(0, 20) || "—"}
                  {(frame.visualDescription?.length ?? 0) > 20 ? "…" : ""}
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">{FRAME_TYPE_LABELS[frame.frameType]}</td>
                <td className="px-3 py-1.5 text-muted-foreground">{frame.shotType?.replace("_", " ") ?? "—"}</td>
                <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                  {editingCell?.frameId === frame.id && editingCell?.key === "duration" ? (
                    <input
                      type="number"
                      min={1}
                      defaultValue={frame.durationSeconds}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v) && v > 0) onUpdateFrame(frame.id, { durationSeconds: v });
                        setEditingCell(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className="w-14 rounded border bg-background px-1 py-0.5 text-xs"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCell({ frameId: frame.id, key: "duration" });
                      }}
                    >
                      {frame.durationSeconds}s
                    </button>
                  )}
                </td>
                <td className="px-3 py-1.5 max-w-[140px] truncate text-muted-foreground">
                  {(frame.voiceoverText ?? frame.dialogue ?? "—").slice(0, 30)}
                  {((frame.voiceoverText ?? frame.dialogue)?.length ?? 0) > 30 ? "…" : ""}
                </td>
                <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={frame.approvalStatus}
                    onValueChange={(v) =>
                      onUpdateFrame(frame.id, {
                        approvalStatus: v as StoryboardFrame["approvalStatus"],
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-auto border-0 bg-transparent shadow-none gap-1 px-0 focus:ring-0">
                      <span className="inline-flex items-center gap-1">
                        {getStatusDisplay(frame) === "approved" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                        {getStatusDisplay(frame) === "generated" && <Circle className="h-3 w-3 text-blue-500 fill-blue-500" />}
                        {frame.approvalStatus?.replace("_", " ")}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">draft</SelectItem>
                      <SelectItem value="pending_review">pending review</SelectItem>
                      <SelectItem value="approved">approved</SelectItem>
                      <SelectItem value="needs_revision">needs revision</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-1.5 text-muted-foreground font-mono text-xs">
                  {frame.linkedTaskId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
