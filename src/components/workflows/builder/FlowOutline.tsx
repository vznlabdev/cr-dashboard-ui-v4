"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WorkflowStepConfig,
  WorkflowStepType,
  WorkflowTrigger,
} from "@/types/workflow-builder";
import {
  STEP_TYPE_CONFIG,
  getStepTypeLabel,
} from "@/lib/workflow-step-config";
import type { WorkflowStepType as LegacyWorkflowStepType } from "@/types/workflows";
import type { WorkflowStepTypeConfig } from "@/lib/workflow-step-config";

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  on_task_created: "On task created",
  on_schedule: "On schedule",
  on_asset_upload: "On asset upload",
  on_brief_approved: "On brief approved",
};

const STEP_TYPES: WorkflowStepType[] = [
  "image_generation",
  "video_generation",
  "voice_audio",
  "text_script",
  "enhancement",
  "review_approval",
  "custom",
];

export interface FlowOutlineProps {
  trigger: WorkflowTrigger | undefined;
  steps: WorkflowStepConfig[];
  selectedStepId: string | null;
  onSelectTrigger: () => void;
  onSelectStep: (stepId: string) => void;
  onAddStep: (stepType: WorkflowStepType) => void;
  onReorderStep: (fromIndex: number, toIndex: number) => void;
  onRemoveStep: (stepId: string) => void;
}

export function FlowOutline({
  trigger,
  steps,
  selectedStepId,
  onSelectTrigger,
  onSelectStep,
  onAddStep,
  onReorderStep,
  onRemoveStep,
}: FlowOutlineProps) {
  const triggerLabel =
    trigger?.type != null ? TRIGGER_LABELS[trigger.type] ?? trigger.type : "Not set";
  const isTriggerSelected = selectedStepId === "trigger";

  return (
    <div className="p-4 flex flex-col items-stretch gap-0">
      {/* Trigger node */}
      <button
        type="button"
        onClick={onSelectTrigger}
        className={cn(
          "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors",
          "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20",
          isTriggerSelected &&
            "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-background"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/50">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Trigger
          </p>
          <p className="text-sm font-medium truncate">{triggerLabel}</p>
        </div>
      </button>

      <div className="ml-5 w-0.5 h-4 bg-border shrink-0" />

      {steps.map((step, index) => {
        const typeConfig = STEP_TYPE_CONFIG[
          step.stepType as LegacyWorkflowStepType
        ] as WorkflowStepTypeConfig | undefined;
        const isSelected = selectedStepId === step.id;
        const canMoveUp = index > 0;
        const canMoveDown = index < steps.length - 1;

        return (
          <div key={step.id} className="flex flex-col items-stretch gap-0">
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border p-3 text-left transition-colors group",
                "border-border bg-card hover:bg-muted/50",
                isSelected &&
                  "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-background border-blue-300 dark:border-blue-700"
              )}
            >
              <button
                type="button"
                onClick={() => onSelectStep(step.id)}
                className="flex flex-1 min-w-0 items-center gap-3 text-left"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                  {step.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{step.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-medium",
                        typeConfig?.lightBg,
                        typeConfig?.textColor,
                        typeConfig?.borderColor
                      )}
                    >
                      {typeConfig?.label ?? step.stepType}
                    </Badge>
                    {step.estimatedMinutes != null && (
                      <span className="text-xs text-muted-foreground">
                        ~{step.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!canMoveUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canMoveUp) onReorderStep(index, index - 1);
                  }}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!canMoveDown}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canMoveDown) onReorderStep(index, index + 1);
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStep(step.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="ml-5 w-0.5 h-4 bg-border shrink-0" />
          </div>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {STEP_TYPES.map((stepType) => {
            const config = STEP_TYPE_CONFIG[
              stepType as LegacyWorkflowStepType
            ] as WorkflowStepTypeConfig | undefined;
            const Icon = config?.icon;
            return (
              <DropdownMenuItem
                key={stepType}
                onSelect={() => onAddStep(stepType)}
              >
                {Icon && <Icon className="h-4 w-4 mr-2 shrink-0" />}
                <span>{getStepTypeLabel(stepType as LegacyWorkflowStepType)}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
