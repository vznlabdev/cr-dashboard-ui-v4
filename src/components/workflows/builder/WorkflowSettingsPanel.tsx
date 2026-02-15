"use client";

import { useCallback, useMemo, useState, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TagInput } from "@/components/ui/tag-input";
import { ChevronDown, ChevronRight, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowTemplate } from "@/types/workflow-builder";
import {
  ProvenanceSettings,
  type ProvenanceSettingsData,
  type ProvenanceComplianceLevel,
} from "./ProvenanceSettings";
import {
  STEP_TYPE_CONFIG,
  getStepTypeLabel,
} from "@/lib/workflow-step-config";
import type { WorkflowStepType as LegacyWorkflowStepType } from "@/types/workflows";
import type { WorkflowStepTypeConfig } from "@/lib/workflow-step-config";

const CATEGORIES: { value: WorkflowTemplate["category"]; label: string }[] = [
  { value: "video", label: "Video" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "mixed", label: "Mixed" },
  { value: "text", label: "Text" },
  { value: "custom", label: "Custom" },
];

const MOCK_DEPARTMENTS = [
  { id: "dept-creative", name: "Creative" },
  { id: "dept-marketing", name: "Marketing" },
  { id: "dept-legal", name: "Legal" },
  { id: "dept-ops", name: "Operations" },
];

const MOCK_ROLES = [
  { id: "role-creator", name: "Creator" },
  { id: "role-pm", name: "Project Manager" },
  { id: "role-admin", name: "Admin" },
];

interface WorkflowSettingsPanelProps {
  template: Partial<WorkflowTemplate>;
  onChange: (updates: Partial<WorkflowTemplate>) => void;
  /** Optional map of tool ID → display name for the summary chips */
  toolDisplayNames?: Record<string, string>;
}

function MultiSelectPopover({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
}: {
  label: string;
  options: { id: string; name: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };
  const selectedNames = options.filter((o) => value.includes(o.id)).map((o) => o.name);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between h-9 font-normal text-muted-foreground"
          >
            <span className="truncate">
              {selectedNames.length > 0 ? selectedNames.join(", ") : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
        <div className="max-h-48 overflow-auto space-y-1">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={value.includes(opt.id)}
                onChange={() => toggle(opt.id)}
                className="rounded border-input"
              />
              {opt.name}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function WorkflowSettingsPanel({
  template,
  onChange,
  toolDisplayNames = {},
}: WorkflowSettingsPanelProps) {
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (updates: Partial<WorkflowTemplate>) => {
      onChange(updates);
    },
    [onChange]
  );

  const steps = useMemo(
    () => [...(template.steps ?? [])].sort((a, b) => a.order - b.order),
    [template.steps]
  );

  const totalMinutes = useMemo(
    () => steps.reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0),
    [steps]
  );

  const toolsUsed = useMemo(() => {
    const ids = [...new Set(steps.map((s) => s.selectedToolId).filter(Boolean))] as string[];
    return ids;
  }, [steps]);

  const stepTypes = useMemo(
    () => [...new Set(steps.map((s) => s.stepType))],
    [steps]
  );

  const handleThumbnailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      update({ thumbnail: url });
    },
    [update]
  );

  return (
    <div className="space-y-6">
      {/* Section 1: Basic Info */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wf-name" className="text-xs">
              Name
            </Label>
            <Input
              id="wf-name"
              value={template.name ?? ""}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Workflow name"
              className="text-base h-10 font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wf-desc" className="text-xs">
              Description
            </Label>
            <Textarea
              id="wf-desc"
              value={template.description ?? ""}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Brief description of this workflow"
              rows={3}
              className="resize-none text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select
              value={template.category ?? "mixed"}
              onValueChange={(value) =>
                update({ category: value as WorkflowTemplate["category"] })
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tags</Label>
            <TagInput
              value={template.tags ?? []}
              onChange={(tags) => update({ tags })}
              placeholder="Type to add tags..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Thumbnail (optional)</Label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors min-h-[80px] text-muted-foreground text-sm"
              )}
            >
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt="Thumbnail"
                  className="max-h-20 w-full object-contain rounded-md bg-muted"
                />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8" />
                  <span>Add thumbnail</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Summary (read-only) */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-muted-foreground">
              Total steps: <span className="font-medium text-foreground">{steps.length}</span>
            </span>
            <span className="text-muted-foreground">
              Estimated time:{" "}
              <span className="font-medium text-foreground">{totalMinutes} min</span>
            </span>
          </div>
          {toolsUsed.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Tools used</span>
              <div className="flex flex-wrap gap-1.5">
                {toolsUsed.map((id) => (
                  <Badge key={id} variant="secondary" className="text-xs font-normal">
                    {toolDisplayNames[id] ?? id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {stepTypes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Step types</span>
              <div className="flex flex-wrap gap-1.5">
                {stepTypes.map((type) => {
                  const config = STEP_TYPE_CONFIG[
                    type as LegacyWorkflowStepType
                  ] as WorkflowStepTypeConfig | undefined;
                  return (
                    <Badge
                      key={type}
                      variant="secondary"
                      className={cn(
                        "text-xs font-normal",
                        config?.lightBg,
                        config?.textColor,
                        config?.borderColor
                      )}
                    >
                      {getStepTypeLabel(type as LegacyWorkflowStepType)}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2b: Provenance & Compliance (workflow level) */}
      <Collapsible
        open={provenanceOpen}
        onOpenChange={setProvenanceOpen}
        className="rounded-lg border border-border"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="py-3 px-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-1.5 text-left text-sm font-medium hover:opacity-80">
              <span className="flex items-center gap-1.5">
                {provenanceOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                Provenance & Compliance
              </span>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 px-4 pb-4">
              <ProvenanceSettings
                level="workflow"
                settings={{
                  requireExtension: true,
                  requireModelVersionLog: true,
                  requireManualEntry: false,
                  capturePrompts: true,
                  captureOutputHashes: true,
                  captureTokenUsage: false,
                  generateCertificateOnCompletion: false,
                  complianceLevel: (template.complianceLevel ?? "standard") as ProvenanceComplianceLevel,
                }}
                onChange={(s: ProvenanceSettingsData) =>
                  update({
                    complianceLevel: s.complianceLevel as WorkflowTemplate["complianceLevel"],
                  })
                }
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Section 3: Access & Governance (collapsible) */}
      <Collapsible
        open={governanceOpen}
        onOpenChange={setGovernanceOpen}
        className="rounded-lg border border-border"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="py-3 px-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-1.5 text-left text-sm font-medium hover:opacity-80">
              <span className="flex items-center gap-1.5">
                {governanceOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                Access & Governance
              </span>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0 px-4 pb-4 space-y-4">
              <MultiSelectPopover
                label="Department restrictions"
                options={MOCK_DEPARTMENTS}
                value={template.departmentRestrictions ?? []}
                onChange={(ids) => update({ departmentRestrictions: ids })}
                placeholder="All departments"
              />
              <MultiSelectPopover
                label="Role restrictions"
                options={MOCK_ROLES}
                value={template.roleRestrictions ?? []}
                onChange={(ids) => update({ roleRestrictions: ids })}
                placeholder="All roles"
              />
              <div className="flex items-center justify-between">
                <Label htmlFor="wf-insurance" className="text-sm font-normal">
                  Require active insurance policy
                </Label>
                <Switch
                  id="wf-insurance"
                  checked={template.insurancePolicyRequired ?? false}
                  onCheckedChange={(checked) =>
                    update({ insurancePolicyRequired: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wf-system" className="text-sm font-normal">
                  Available as system template
                </Label>
                <Switch
                  id="wf-system"
                  checked={template.isSystem ?? false}
                  onCheckedChange={(checked) => update({ isSystem: checked })}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
