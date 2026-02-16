"use client";

import { useState, useCallback } from "react";
import { FileText, Film, FileJson, FileSpreadsheet, ListOrdered } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Storyboard, StoryboardFrame } from "@/types/storyboard";

export type ExportFormatChoice = "pdf" | "animatic" | "json" | "csv" | "edl";

const FORMAT_CARDS: {
  id: ExportFormatChoice;
  label: string;
  sublabel: string;
  icon: typeof FileText;
  comingSoon?: boolean;
  tooltip?: string;
}[] = [
  { id: "pdf", label: "PDF", sublabel: "Shot Sheet", icon: FileText },
  {
    id: "animatic",
    label: "Video",
    sublabel: "Animatic",
    icon: Film,
    comingSoon: true,
    tooltip: "Requires backend video processing — coming in a future release.",
  },
  { id: "json", label: "JSON", sublabel: "Editor Import", icon: FileJson },
  { id: "csv", label: "CSV", sublabel: "Spreadsheet", icon: FileSpreadsheet },
  {
    id: "edl",
    label: "EDL",
    sublabel: "Timeline",
    icon: ListOrdered,
    comingSoon: true,
    tooltip: "Edit Decision List export for Premiere/Final Cut — coming in a future release.",
  },
];

const FRAME_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

const FRAMES_PER_ROW = [2, 3, 4] as const;

const RESOLUTIONS = [
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
  { value: "4k", label: "4K" },
] as const;

const TARGET_EDITORS = [
  { value: "generic", label: "Generic" },
  { value: "premiere", label: "Premiere" },
  { value: "finalcut", label: "Final Cut" },
  { value: "davinci", label: "DaVinci Resolve" },
] as const;

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storyboard: Storyboard;
}

function getOrderedFrames(storyboard: Storyboard): StoryboardFrame[] {
  return [...storyboard.frames].sort((a, b) => a.order - b.order);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ExportDialog({ isOpen, onClose, storyboard }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormatChoice>("pdf");
  const [frameSize, setFrameSize] = useState<"small" | "medium" | "large">("medium");
  const [framesPerRow, setFramesPerRow] = useState(2);
  const [includeScript, setIncludeScript] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeTiming, setIncludeTiming] = useState(true);
  const [includeAssetLinks, setIncludeAssetLinks] = useState(false);
  const [includeProvenance, setIncludeProvenance] = useState(false);
  const [animaticTransitions, setAnimaticTransitions] = useState(true);
  const [animaticOverlayScript, setAnimaticOverlayScript] = useState(true);
  const [animaticResolution, setAnimaticResolution] = useState("1080p");
  const [jsonTargetEditor, setJsonTargetEditor] = useState("generic");
  const [jsonIncludeAssets, setJsonIncludeAssets] = useState(true);
  const [jsonIncludeTiming, setJsonIncludeTiming] = useState(true);
  const [exporting, setExporting] = useState(false);

  const orderedFrames = getOrderedFrames(storyboard);

  const handleExportPdf = useCallback(() => {
    const rows = framesPerRow;
    const maxWidth = frameSize === "small" ? 140 : frameSize === "large" ? 280 : 200;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(storyboard.title)} — Storyboard</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #1a1a1a; background: #fff; }
    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .meta { font-size: 0.75rem; color: #666; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(${rows}, 1fr); gap: 16px; }
    .frame { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; break-inside: avoid; }
    .frame-img { width: 100%; max-width: ${maxWidth}px; aspect-ratio: 16/9; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #888; }
    .frame-img img { width: 100%; height: 100%; object-fit: cover; }
    .frame-body { padding: 8px; }
    .frame-num { font-size: 0.65rem; color: #666; margin-bottom: 4px; }
    .frame-desc { font-size: 0.75rem; margin-bottom: 4px; }
    .frame-script { font-size: 0.7rem; color: #444; margin-top: 4px; }
    .frame-notes { font-size: 0.65rem; color: #666; margin-top: 4px; }
    .frame-timing { font-size: 0.65rem; color: #666; }
    .frame-assets { font-size: 0.65rem; color: #888; }
    @media print { body { padding: 12px; } .frame { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(storyboard.title)}</h1>
  <p class="meta">${storyboard.frames.length} frames · ${storyboard.totalDurationSeconds}s total${storyboard.format ? ` · ${storyboard.format}` : ""}</p>
  <div class="grid">
    ${orderedFrames.map((f, i) => {
      const vo = f.voiceoverText || f.dialogue || "";
      const script = includeScript ? [vo, f.soundEffects ? `[SFX] ${f.soundEffects}` : "", f.musicNotes ? `[MUSIC] ${f.musicNotes}` : ""].filter(Boolean).join(" · ") : "";
      const notes = includeNotes && f.notes ? f.notes : "";
      const timing = includeTiming ? `${f.durationSeconds}s` : "";
      const assets = includeAssetLinks && f.linkedAssetIds?.length ? `Assets: ${f.linkedAssetIds.length}` : "";
      return `
    <div class="frame">
      <div class="frame-img">${f.thumbnailUrl ? `<img src="${escapeHtml(f.thumbnailUrl)}" alt="" />` : `Frame ${i + 1}`}</div>
      <div class="frame-body">
        <div class="frame-num">Frame ${i + 1}${f.shotType ? ` · ${f.shotType}` : ""}</div>
        <div class="frame-desc">${escapeHtml(f.visualDescription || "—")}</div>
        ${script ? `<div class="frame-script">${escapeHtml(script)}</div>` : ""}
        ${notes ? `<div class="frame-notes">${escapeHtml(notes)}</div>` : ""}
        ${timing ? `<div class="frame-timing">${timing}</div>` : ""}
        ${assets ? `<div class="frame-assets">${assets}</div>` : ""}
      </div>
    </div>`;
    }).join("")}
  </div>
  ${includeProvenance && storyboard.provenanceEnabled ? `<p class="meta" style="margin-top: 20px;">Provenance tracking enabled · ${escapeHtml(storyboard.updatedAt)}</p>` : ""}
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }, [storyboard, orderedFrames, framesPerRow, frameSize, includeScript, includeNotes, includeTiming, includeAssetLinks, includeProvenance]);

  const handleExportJson = useCallback(() => {
    const payload = {
      ...storyboard,
      exportedAt: new Date().toISOString(),
      exportOptions: { targetEditor: jsonTargetEditor, includeAssetRefs: jsonIncludeAssets, includeTiming: jsonIncludeTiming },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    downloadBlob(blob, `${storyboard.title.replace(/[^\w\s-]/g, "")}-storyboard.json`);
  }, [storyboard, jsonTargetEditor, jsonIncludeAssets, jsonIncludeTiming]);

  const handleExportCsv = useCallback(() => {
    const headers = ["Frame#", "Name", "Type", "Shot", "Camera", "Duration", "Dialogue", "VO", "SFX", "Music", "Status", "Notes"];
    const rows = orderedFrames.map((f, i) => [
      i + 1,
      f.visualDescription?.slice(0, 80) ?? "",
      f.frameType ?? "",
      f.shotType ?? "",
      f.cameraMovement ?? "",
      f.durationSeconds ?? "",
      f.dialogue ?? "",
      f.voiceoverText ?? "",
      f.soundEffects ?? "",
      f.musicNotes ?? "",
      f.approvalStatus ?? "",
      f.notes ?? "",
    ].map((c) => escapeCsvCell(String(c))).join(","));
    const csv = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${storyboard.title.replace(/[^\w\s-]/g, "")}-storyboard.csv`);
  }, [storyboard, orderedFrames]);

  const handleExport = useCallback(async () => {
    if (format === "animatic" || format === "edl") return;
    setExporting(true);
    try {
      if (format === "pdf") handleExportPdf();
      else if (format === "json") handleExportJson();
      else if (format === "csv") handleExportCsv();
      onClose();
    } finally {
      setExporting(false);
    }
  }, [format, handleExportPdf, handleExportJson, handleExportCsv, onClose]);

  const canExport = format === "pdf" || format === "json" || format === "csv";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Storyboard</DialogTitle>
          <p className="text-sm text-muted-foreground truncate" title={storyboard.title}>
            &quot;{storyboard.title}&quot;
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
              {FORMAT_CARDS.map((card) => {
                const isSelected = format === card.id;
                const disabled = !!card.comingSoon;
                const content = (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setFormat(card.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 rounded-lg border p-3 text-center transition-colors",
                      disabled && "opacity-60 cursor-not-allowed",
                      !disabled && "hover:border-primary/50 hover:bg-muted/30",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
                    )}
                  >
                    <card.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium">{card.label}</span>
                    <span className="text-[10px] text-muted-foreground">{card.sublabel}</span>
                    {card.comingSoon && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">COMING SOON</span>
                    )}
                  </button>
                );
                if (card.tooltip) {
                  return (
                    <TooltipProvider key={card.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent>{card.tooltip}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
                return <div key={card.id}>{content}</div>;
              })}
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Options</Label>

            {format === "pdf" && (
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Frame size</Label>
                    <Select value={frameSize} onValueChange={(v) => setFrameSize(v as "small" | "medium" | "large")}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAME_SIZES.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Frames per row</Label>
                    <Select value={String(framesPerRow)} onValueChange={(v) => setFramesPerRow(Number(v))}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAMES_PER_ROW.map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={includeScript} onCheckedChange={(c) => setIncludeScript(!!c)} />
                    Include script text
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={includeNotes} onCheckedChange={(c) => setIncludeNotes(!!c)} />
                    Include production notes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={includeTiming} onCheckedChange={(c) => setIncludeTiming(!!c)} />
                    Include timing information
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={includeAssetLinks} onCheckedChange={(c) => setIncludeAssetLinks(!!c)} />
                    Include asset links
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={includeProvenance} onCheckedChange={(c) => setIncludeProvenance(!!c)} />
                    Include provenance data (for underwriters)
                  </label>
                </div>
              </div>
            )}

            {format === "animatic" && (
              <div className="grid gap-3 text-sm text-muted-foreground">
                <label className="flex items-center gap-2">
                  <Checkbox checked={animaticTransitions} onCheckedChange={(c) => setAnimaticTransitions(!!c)} disabled />
                  Show frame transitions
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox checked={animaticOverlayScript} onCheckedChange={(c) => setAnimaticOverlayScript(!!c)} disabled />
                  Overlay script text
                </label>
                <div>
                  <Label className="text-xs">Resolution</Label>
                  <Select value={animaticResolution} onValueChange={setAnimaticResolution} disabled>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs">
                  Generates a slideshow-style video using frame images at set durations. (Coming soon.)
                </p>
              </div>
            )}

            {(format === "json" || format === "edl") && (
              <div className="grid gap-3">
                <div>
                  <Label className="text-xs">Target editor</Label>
                  <Select value={jsonTargetEditor} onValueChange={setJsonTargetEditor} disabled={format === "edl"}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_EDITORS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.value === "generic" ? "Generic" : t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={jsonIncludeAssets} onCheckedChange={(c) => setJsonIncludeAssets(!!c)} disabled={format === "edl"} />
                  Include asset file references
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={jsonIncludeTiming} onCheckedChange={(c) => setJsonIncludeTiming(!!c)} disabled={format === "edl"} />
                  Include timing markers
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!canExport || exporting}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
