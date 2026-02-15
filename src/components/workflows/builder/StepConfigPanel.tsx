"use client";

import { useCallback, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolRequestModal } from "./ToolRequestModal";
import { ToolInfoTooltip } from "./ToolInfoTooltip";
import {
  ProvenanceSettings,
  type ProvenanceSettingsData,
} from "./ProvenanceSettings";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  Lock,
  Ban,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WorkflowStepConfig,
  WorkflowStepType,
  WhitelistedTool,
} from "@/types/workflow-builder";
import {
  STEP_TYPE_CONFIG,
  getStepTypeLabel,
} from "@/lib/workflow-step-config";
import type { WorkflowStepType as LegacyWorkflowStepType } from "@/types/workflows";
import type { WorkflowStepTypeConfig } from "@/lib/workflow-step-config";

const STEP_TYPES: WorkflowStepType[] = [
  "image_generation",
  "video_generation",
  "voice_audio",
  "text_script",
  "enhancement",
  "review_approval",
  "custom",
];

const PROMPT_VARIABLES = [
  { label: "{project_name}", value: "{project_name}" },
  { label: "{brand_name}", value: "{brand_name}" },
  { label: "{brief}", value: "{brief}" },
];


function approvalStatusIcon(status: WhitelistedTool["approvalStatus"]) {
  switch (status) {
    case "approved":
      return <Check className="h-3 w-3" />;
    case "pending_review":
      return <Clock className="h-3 w-3" />;
    case "restricted":
      return <Lock className="h-3 w-3" />;
    case "blocked":
      return <Ban className="h-3 w-3" />;
    default:
      return null;
  }
}

function approvalStatusBadgeClass(status: WhitelistedTool["approvalStatus"]) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    case "pending_review":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    case "restricted":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
    case "blocked":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    default:
      return "";
  }
}

function approvalStatusLabel(status: WhitelistedTool["approvalStatus"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending_review":
      return "Pending Review";
    case "restricted":
      return "Restricted";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
}

interface StepConfigPanelProps {
  step: WorkflowStepConfig;
  onChange: (step: WorkflowStepConfig) => void;
  availableTools: WhitelistedTool[];
}

function SectionHeader({
  open,
  title,
  action,
}: {
  open: boolean;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-1.5 text-left text-sm font-medium hover:opacity-80">
      <span className="flex items-center gap-1.5">
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        {title}
      </span>
      {action}
    </CollapsibleTrigger>
  );
}

export function StepConfigPanel({
  step,
  onChange,
  availableTools,
}: StepConfigPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [toolOpen, setToolOpen] = useState(true);
  const [promptOpen, setPromptOpen] = useState(true);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [toolRequestModalOpen, setToolRequestModalOpen] = useState(false);

  const updateStep = useCallback(
    (updates: Partial<WorkflowStepConfig>) => {
      onChange({ ...step, ...updates });
    },
    [step, onChange]
  );

  const typeConfig = STEP_TYPE_CONFIG[
    step.stepType as LegacyWorkflowStepType
  ] as WorkflowStepTypeConfig | undefined;

  const approvedTools = availableTools.filter((t) => t.approvalStatus === "approved");
  const otherTools = availableTools.filter((t) => t.approvalStatus !== "approved");
  const selectedTool = availableTools.find((t) => t.id === step.selectedToolId);

  const insertVariable = useCallback(
    (variable: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = (step.promptTemplate ?? "").slice(0, start);
      const after = (step.promptTemplate ?? "").slice(end);
      updateStep({ promptTemplate: before + variable + after });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    },
    [step.promptTemplate, updateStep]
  );

  const addTip = useCallback(() => {
    const tips = step.tips ?? [];
    updateStep({ tips: [...tips, ""] });
  }, [step.tips, updateStep]);

  const updateTip = useCallback(
    (index: number, value: string) => {
      const tips = [...(step.tips ?? [])];
      tips[index] = value;
      updateStep({ tips });
    },
    [step.tips, updateStep]
  );

  const removeTip = useCallback(
    (index: number) => {
      const tips = (step.tips ?? []).filter((_, i) => i !== index);
      updateStep({ tips });
    },
    [step.tips, updateStep]
  );

  const addCriterion = useCallback(() => {
    const criteria = step.acceptanceCriteria ?? [];
    updateStep({ acceptanceCriteria: [...criteria, ""] });
  }, [step.acceptanceCriteria, updateStep]);

  const updateCriterion = useCallback(
    (index: number, value: string) => {
      const criteria = [...(step.acceptanceCriteria ?? [])];
      criteria[index] = value;
      updateStep({ acceptanceCriteria: criteria });
    },
    [step.acceptanceCriteria, updateStep]
  );

  const removeCriterion = useCallback(
    (index: number) => {
      const criteria = (step.acceptanceCriteria ?? []).filter((_, i) => i !== index);
      updateStep({ acceptanceCriteria: criteria });
    },
    [step.acceptanceCriteria, updateStep]
  );

  return (
    <div className="space-y-4">
      {/* Section 1: Step Header (always visible) */}
      <Card className="border border-border">
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Step {step.order}
          </p>
          <div className="space-y-2">
            <Label htmlFor="step-name" className="text-xs">
              Step name
            </Label>
            <Input
              id="step-name"
              value={step.name}
              onChange={(e) => updateStep({ name: e.target.value })}
              placeholder="e.g. Generate hero image"
              className="h-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1.5 min-w-[140px]">
              <Label className="text-xs">Type</Label>
              <Select
                value={step.stepType}
                onValueChange={(value) => {
                  const type = value as WorkflowStepType;
                  const config = STEP_TYPE_CONFIG[type as LegacyWorkflowStepType];
                  updateStep({
                    stepType: type,
                    estimatedMinutes: config?.defaultEstimate ?? step.estimatedMinutes,
                  });
                }}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((t) => {
                    const cfg = STEP_TYPE_CONFIG[t as LegacyWorkflowStepType];
                    return (
                      <SelectItem key={t} value={t}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full shrink-0",
                              cfg?.color ?? "bg-muted"
                            )}
                          />
                          {getStepTypeLabel(t as LegacyWorkflowStepType)}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 w-20">
              <Label className="text-xs">Est. (min)</Label>
              <Input
                type="number"
                min={1}
                max={480}
                value={step.estimatedMinutes ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  updateStep({
                    estimatedMinutes: v === "" ? undefined : parseInt(v, 10) || undefined,
                  });
                }}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Tool Selection (collapsible, default open) */}
      <Collapsible open={toolOpen} onOpenChange={setToolOpen} className="rounded-lg border border-border">
        <CardHeader className="py-3 px-4">
          <SectionHeader open={toolOpen} title="AI Tool" />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Selected</Label>
              <Select
                value={step.selectedToolId ?? ""}
                onValueChange={(value) =>
                  updateStep({
                    selectedToolId: value || undefined,
                    allowedTools: value
                      ? [...new Set([...(step.allowedTools ?? []), value])]
                      : step.allowedTools,
                  })
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  {approvedTools.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.internalAlias ?? t.name}
                    </SelectItem>
                  ))}
                  {approvedTools.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No approved tools
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedTool && !selectedTool.indemnified && (
              <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                No IP indemnification
              </p>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Approved tools</Label>
              <div className="flex flex-wrap gap-1.5">
                {approvedTools.map((t) => {
                  const isSelected = step.selectedToolId === t.id;
                  return (
                    <ToolInfoTooltip key={t.id} tool={t}>
                      <button
                        type="button"
                        onClick={() =>
                          updateStep({
                            selectedToolId: t.id,
                            allowedTools: [...new Set([...(step.allowedTools ?? []), t.id])],
                          })
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                          "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20",
                          isSelected &&
                            "ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-background"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-emerald-600" />}
                        {t.internalAlias ?? t.name}
                      </button>
                    </ToolInfoTooltip>
                  );
                })}
              </div>
            </div>

            {otherTools.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Other tools</Label>
                <div className="flex flex-wrap gap-1.5">
                  {otherTools.map((t) => {
                    const statusBadgeClass = approvalStatusBadgeClass(t.approvalStatus);
                    return (
                      <ToolInfoTooltip key={t.id} tool={t}>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs opacity-70",
                            "border-border bg-muted/50 cursor-not-allowed"
                          )}
                        >
                          {approvalStatusIcon(t.approvalStatus)}
                          <span>{t.internalAlias ?? t.name}</span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-normal", statusBadgeClass)}
                          >
                            {approvalStatusLabel(t.approvalStatus)}
                          </Badge>
                        </span>
                      </ToolInfoTooltip>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="allow-creator-tool"
                checked={step.allowCreatorToolChoice}
                onCheckedChange={(checked) =>
                  updateStep({ allowCreatorToolChoice: checked === true })
                }
              />
              <Label htmlFor="allow-creator-tool" className="text-xs font-normal">
                Allow creator to pick different approved tool
              </Label>
            </div>

            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => setToolRequestModalOpen(true)}
            >
              Request new tool →
            </Button>
            <ToolRequestModal
              isOpen={toolRequestModalOpen}
              onClose={() => setToolRequestModalOpen(false)}
              stepType={step.stepType}
              existingTools={availableTools}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 3: Prompt Template (collapsible, default open) */}
      <Collapsible open={promptOpen} onOpenChange={setPromptOpen} className="rounded-lg border border-border">
        <CardHeader className="py-3 px-4">
          <SectionHeader open={promptOpen} title="Prompt Template" />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4 space-y-2">
            <Textarea
              ref={textareaRef}
              value={step.promptTemplate ?? ""}
              onChange={(e) => updateStep({ promptTemplate: e.target.value })}
              placeholder="Enter the prompt template creators will use for this step..."
              className="min-h-[80px] text-sm"
            />
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>Variables:</span>
              {PROMPT_VARIABLES.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => insertVariable(v.value)}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono hover:bg-muted/80"
                >
                  {v.label}
                </button>
              ))}
              <span className="text-[10px]">(click to insert)</span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 4: Tips (collapsible, default closed) */}
      <Collapsible open={tipsOpen} onOpenChange={setTipsOpen} className="rounded-lg border border-border">
        <CardHeader className="py-3 px-4">
          <SectionHeader
            open={tipsOpen}
            title="Tips"
            action={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTip();
                }}
              >
                <Plus className="h-3.5 w-3 mr-1" />
                Add tip
              </Button>
            }
          />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4 space-y-2">
            {(step.tips ?? []).map((tip, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-muted-foreground">•</span>
                <Input
                  value={tip}
                  onChange={(e) => updateTip(i, e.target.value)}
                  placeholder="Tip for creators"
                  className="h-8 text-sm flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeTip(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {(step.tips ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">No tips yet.</p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 5: Acceptance Criteria (collapsible, default closed) */}
      <Collapsible open={criteriaOpen} onOpenChange={setCriteriaOpen} className="rounded-lg border border-border">
        <CardHeader className="py-3 px-4">
          <SectionHeader
            open={criteriaOpen}
            title="Acceptance Criteria"
            action={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addCriterion();
                }}
              >
                <Plus className="h-3.5 w-3 mr-1" />
                Add criteria
              </Button>
            }
          />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4 space-y-2">
            {(step.acceptanceCriteria ?? []).map((criterion, i) => (
              <div key={i} className="flex items-center gap-2">
                <Checkbox checked={false} disabled className="shrink-0" />
                <Input
                  value={criterion}
                  onChange={(e) => updateCriterion(i, e.target.value)}
                  placeholder="e.g. Output matches brand color palette"
                  className="h-8 text-sm flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCriterion(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {(step.acceptanceCriteria ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">No criteria yet.</p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Section 6: Provenance & Compliance (collapsible, default closed) */}
      <Collapsible open={provenanceOpen} onOpenChange={setProvenanceOpen} className="rounded-lg border border-border">
        <CardHeader className="py-3 px-4">
          <SectionHeader open={provenanceOpen} title="Provenance & Compliance" />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <ProvenanceSettings
              level="step"
              settings={{
                requireExtension: step.requireProvenanceCapture,
                requireModelVersionLog: step.requireModelVersionLog,
                requireManualEntry: false,
                capturePrompts: true,
                captureOutputHashes: true,
              }}
              onChange={(s: ProvenanceSettingsData) =>
                updateStep({
                  requireProvenanceCapture: s.requireExtension,
                  requireModelVersionLog: s.requireModelVersionLog,
                })
              }
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
