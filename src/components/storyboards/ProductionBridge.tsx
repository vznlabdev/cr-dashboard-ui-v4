"use client";

import { useState } from "react";
import {
  CheckSquare,
  GitBranch,
  Image,
  Link2,
  Plus,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTaskById, getTasksByProject } from "@/lib/mock-data/projects-tasks";
import { getWorkflowTemplateById } from "@/lib/mock-data/workflows";
import { getAssetById } from "@/lib/mock-data/creative";
import type { Task } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Storyboard, StoryboardFrame } from "@/types/storyboard";

export interface ProductionBridgeProps {
  frame: StoryboardFrame;
  storyboard: Storyboard;
  onLinkTask: (frameId: string, taskId: string) => void;
  onCreateTask: (frameId: string) => void;
  onLinkWorkflow: (frameId: string, workflowId: string) => void;
  onLinkAsset: (frameId: string, assetId: string) => void;
}

export function ProductionBridge({
  frame,
  storyboard,
  onLinkTask,
  onCreateTask,
  onLinkWorkflow,
  onLinkAsset,
}: ProductionBridgeProps) {
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const linkedTask = frame.linkedTaskId ? getTaskById(frame.linkedTaskId) : null;
  const linkedWorkflow = frame.linkedWorkflowId
    ? getWorkflowTemplateById(frame.linkedWorkflowId)
    : null;
  const projectId = storyboard.projectId;
  const assetIds = frame.linkedAssetIds ?? [];

  const linkedAssets = assetIds
    .map((id) => getAssetById(id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  const statusLabel = linkedTask?.status
    ? linkedTask.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";
  const priorityLabel = linkedTask?.priority ?? "—";
  const assigneeLabel = linkedTask?.assignee ?? "—";

  return (
    <div className="space-y-4">
      {/* Task */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Task</p>
        {linkedTask ? (
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{linkedTask.title}</p>
              <p className="text-xs text-muted-foreground">
                {statusLabel}
                {assigneeLabel !== "—" && ` · ${assigneeLabel}`}
                {priorityLabel !== "—" && ` · ${String(priorityLabel).charAt(0).toUpperCase() + String(priorityLabel).slice(1)}`}
              </p>
            </div>
            {projectId && (
              <Link href={`/projects/${projectId}/tasks/${linkedTask.id}`} className="shrink-0">
                <Button size="sm" variant="ghost" className="h-8">
                  View <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 p-3 text-center text-sm text-muted-foreground">
            No task linked
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setTaskPickerOpen(true)}
          >
            <Link2 className="h-3.5 w-3 mr-1" /> Link existing task
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onCreateTask(frame.id)}>
            <Plus className="h-3.5 w-3 mr-1" /> Create task →
          </Button>
        </div>
        {taskPickerOpen && projectId && (
          <TaskPicker
            projectId={projectId}
            currentLinkedId={frame.linkedTaskId}
            onLinkTask={onLinkTask}
            frameId={frame.id}
            onClose={() => setTaskPickerOpen(false)}
          />
        )}
      </div>

      {/* Workflow */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Workflow</p>
        {linkedWorkflow ? (
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate flex items-center gap-1">
                <GitBranch className="h-3.5 w-3 text-muted-foreground shrink-0" />
                {linkedWorkflow.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {linkedWorkflow.steps?.length ?? 0} steps
                {linkedWorkflow.estimatedTotalMinutes != null &&
                  ` · ~${linkedWorkflow.estimatedTotalMinutes} min`}
              </p>
            </div>
            <Button size="sm" variant="ghost" className="h-8 shrink-0" asChild>
              <Link href={`/workflows/${linkedWorkflow.id}`}>
                View <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 p-3 text-center text-sm text-muted-foreground">
            No workflow linked
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs mt-2"
          onClick={() => {
            // In a full impl, open workflow picker; for now link first mock template
            const wf = getWorkflowTemplateById("wf-video-production") ?? getWorkflowTemplateById("wf-social-images");
            if (wf) onLinkWorkflow(frame.id, wf.id);
          }}
        >
          Link workflow template
        </Button>
      </div>

      {/* Assets */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">
          Assets ({assetIds.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {linkedAssets.map((asset) => (
            <div
              key={asset.id}
              className="w-20 rounded-lg border border-border/60 bg-muted/10 overflow-hidden flex flex-col"
            >
              <div className="aspect-square bg-muted/30 flex items-center justify-center">
                {asset.thumbnailUrl ? (
                  <img
                    src={asset.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-[10px] font-medium truncate px-1 py-0.5 text-center">
                {asset.name?.slice(0, 8) || "v1"}
              </p>
              <p className="text-[10px] text-muted-foreground px-1 pb-1 text-center capitalize">
                {asset.designType ?? "Draft"}
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => toast.info("Asset picker — connect to asset library to link.")}
            className={cn(
              "w-20 h-[72px] rounded-lg border border-dashed border-border/60",
              "flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:bg-muted/20"
            )}
          >
            <Plus className="h-5 w-5" />
            <span className="text-[10px]">Link Asset</span>
          </button>
        </div>
      </div>

      {/* Provenance */}
      <div className="pt-2 border-t border-border/60">
        <p className="text-xs font-medium text-muted-foreground mb-1">Provenance</p>
        <p className="text-sm flex items-center gap-1.5">
          {storyboard.provenanceEnabled || storyboard.aclarLinked ? (
            <>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Chain complete
            </>
          ) : (
            <>—</>
          )}
        </p>
      </div>
    </div>
  );
}

/** Simple task picker: list tasks in project, select one to link. */
function TaskPicker({
  projectId,
  currentLinkedId,
  onLinkTask,
  frameId,
  onClose,
}: {
  projectId: string;
  currentLinkedId?: string;
  onLinkTask: (frameId: string, taskId: string) => void;
  frameId: string;
  onClose: () => void;
}) {
  const tasks = getTasksByProject(projectId) ?? [];

  return (
    <div className="mt-2 rounded-lg border border-border bg-card p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground mb-2">Tasks in this project</p>
      <ul className="max-h-48 overflow-y-auto space-y-1">
        {tasks.length === 0 ? (
          <li className="text-sm text-muted-foreground py-2">No tasks in project</li>
        ) : (
          tasks.map((t: Task) => (
            <li key={t.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50">
              <span className="text-sm truncate">{t.title}</span>
              <div className="flex gap-1 shrink-0">
                {currentLinkedId === t.id && (
                  <span className="text-xs text-muted-foreground">Linked</span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    onLinkTask(frameId, t.id);
                    onClose();
                  }}
                  type="button"
                >
                  Link
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
      <Button size="sm" variant="outline" className="w-full mt-2" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
}
