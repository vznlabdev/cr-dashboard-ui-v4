"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowOutline } from "@/components/workflows/builder/FlowOutline";
import { TriggerConfigPanel } from "@/components/workflows/builder/TriggerConfigPanel";
import { StepConfigPanel } from "@/components/workflows/builder/StepConfigPanel";
import { WorkflowSettingsPanel } from "@/components/workflows/builder/WorkflowSettingsPanel";
import { useToolWhitelist } from "@/hooks/useToolWhitelist";
import { getSystemWorkflowTemplate } from "@/lib/data/workflow-templates";
import type {
  WorkflowBuilderState,
  WorkflowTemplate,
  WorkflowStepConfig,
  WorkflowTrigger,
  WorkflowStepType,
} from "@/types/workflow-builder";

function generateId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_STATE: WorkflowBuilderState = {
  template: {
    name: "",
    trigger: { type: "manual" },
    steps: [],
    category: "custom",
  },
  activePanel: "settings",
  selectedStepId: null,
  isDirty: false,
  validationErrors: {},
};

export function NewWorkflowPageSkeleton() {
  return (
    <PageContainer className="flex h-[calc(100vh-4rem)] flex-col max-w-full">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/workflows" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Workflows
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    </PageContainer>
  );
}

export function NewWorkflowClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToolsByCategory, getToolById, getApprovedTools } = useToolWhitelist();
  const [state, setState] = useState<WorkflowBuilderState>(INITIAL_STATE);
  const hasLoadedTemplateFromUrl = useRef(false);

  // Pre-load system template once when ?template=id is present
  useEffect(() => {
    if (hasLoadedTemplateFromUrl.current) return;
    const templateId = searchParams.get("template");
    if (!templateId) return;
    const systemTemplate = getSystemWorkflowTemplate(templateId);
    if (!systemTemplate) return;
    hasLoadedTemplateFromUrl.current = true;
    setState({
      template: {
        ...systemTemplate,
        id: "", // New workflow gets a new id on create
      },
      activePanel: "settings",
      selectedStepId: null,
      isDirty: false,
      validationErrors: {},
    });
  }, [searchParams]);

  const { template, selectedStepId, isDirty, validationErrors } = state;

  const steps = useMemo(
    () => [...(template.steps ?? [])].sort((a, b) => a.order - b.order),
    [template.steps]
  );

  const selectedStep = useMemo(
    () =>
      selectedStepId && selectedStepId !== "trigger"
        ? steps.find((s) => s.id === selectedStepId) ?? null
        : null,
    [steps, selectedStepId]
  );

  const totalMinutes = useMemo(
    () => steps.reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0),
    [steps]
  );

  const categoryLabel = template.category
    ? template.category.charAt(0).toUpperCase() + template.category.slice(1)
    : "—";

  const setDirty = useCallback(() => {
    setState((prev) => (prev.isDirty ? prev : { ...prev, isDirty: true }));
  }, []);

  const selectTrigger = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activePanel: "trigger",
      selectedStepId: "trigger",
      isDirty: true,
    }));
  }, []);

  const selectStep = useCallback((stepId: string) => {
    setState((prev) => ({
      ...prev,
      activePanel: "steps",
      selectedStepId: stepId,
      isDirty: true,
    }));
  }, []);

  const selectNothing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activePanel: "settings",
      selectedStepId: null,
    }));
  }, []);

  const addStep = useCallback(
    (stepType: WorkflowStepType) => {
      const approvedTools = getApprovedTools(stepType);
      const typeLabel =
        stepType === "image_generation"
          ? "Image Generation"
          : stepType === "video_generation"
            ? "Video Generation"
            : stepType === "voice_audio"
              ? "Voice & Audio"
              : stepType === "text_script"
                ? "Text & Script"
                : stepType === "enhancement"
                  ? "Enhancement"
                  : stepType === "review_approval"
                    ? "Review & Approval"
                    : "Custom";
      const newStep: WorkflowStepConfig = {
        id: generateId(),
        name: `New ${typeLabel} Step`,
        stepType: stepType,
        order: steps.length + 1,
        required: true,
        allowedTools: approvedTools.map((t) => t.id),
        allowCreatorToolChoice: true,
        requireProvenanceCapture: true,
        requireModelVersionLog: true,
        estimatedMinutes: 15,
      };
      setState((prev) => {
        const newSteps = [...(prev.template.steps ?? []), newStep];
        return {
          ...prev,
          template: { ...prev.template, steps: newSteps },
          activePanel: "steps",
          selectedStepId: newStep.id,
          isDirty: true,
        };
      });
    },
    [steps.length, getApprovedTools]
  );

  const reorderSteps = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const list = [...(prev.template.steps ?? [])].sort((a, b) => a.order - b.order);
      const [removed] = list.splice(fromIndex, 1);
      if (!removed) return prev;
      list.splice(toIndex, 0, removed);
      const reordered = list.map((s, i) => ({ ...s, order: i + 1 }));
      return {
        ...prev,
        template: { ...prev.template, steps: reordered },
        isDirty: true,
      };
    });
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setState((prev) => {
      const steps = (prev.template.steps ?? []).filter((s) => s.id !== stepId);
      const wasSelected = prev.selectedStepId === stepId;
      return {
        ...prev,
        template: { ...prev.template, steps },
        activePanel: wasSelected ? "settings" : prev.activePanel,
        selectedStepId: wasSelected ? null : prev.selectedStepId,
        isDirty: true,
      };
    });
  }, []);

  const handleTriggerChange = useCallback((trigger: WorkflowTrigger) => {
    setState((prev) => ({
      ...prev,
      template: { ...prev.template, trigger },
      isDirty: true,
    }));
  }, []);

  const handleStepChange = useCallback((updatedStep: WorkflowStepConfig) => {
    setState((prev) => {
      const steps = (prev.template.steps ?? []).map((s) =>
        s.id === updatedStep.id ? updatedStep : s
      );
      return {
        ...prev,
        template: { ...prev.template, steps },
        isDirty: true,
      };
    });
  }, []);

  const handleSettingsChange = useCallback((updates: Partial<WorkflowTemplate>) => {
    setState((prev) => ({
      ...prev,
      template: { ...prev.template, ...updates },
      isDirty: true,
    }));
  }, []);

  const setValidationErrors = useCallback(
    (errors: Record<string, string[]>) => {
      setState((prev) => ({ ...prev, validationErrors: errors }));
    },
    []
  );

  const handleSaveDraft = useCallback(() => {
    console.log("[Save Draft] template:", state.template);
  }, [state.template]);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string[]> = {};
    const name = (template.name ?? "").trim();
    if (!name) {
      errors.name = ["Name is required"];
    }
    if (!template.steps?.length) {
      errors.steps = ["Add at least one step"];
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [template.name, template.steps?.length, setValidationErrors]);

  const handleCreate = useCallback(() => {
    if (!validate()) return;
    console.log("[Create Workflow] template:", state.template);
  }, [state.template, validate]);

  const toolDisplayNames = useMemo(() => {
    const ids = new Set(
      (template.steps ?? [])
        .map((s) => s.selectedToolId)
        .filter((id): id is string => Boolean(id))
    );
    const map: Record<string, string> = {};
    ids.forEach((id) => {
      const tool = getToolById(id);
      if (tool) map[id] = tool.internalAlias ?? tool.name;
    });
    return map;
  }, [template.steps, getToolById]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        selectNothing();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectNothing, handleSaveDraft]);

  const rightPanelContent = useMemo(() => {
    if (selectedStepId === "trigger" && template.trigger) {
      return (
        <TriggerConfigPanel
          trigger={template.trigger}
          onChange={handleTriggerChange}
        />
      );
    }
    if (selectedStep && selectedStepId === selectedStep.id) {
      return (
        <StepConfigPanel
          step={selectedStep}
          onChange={handleStepChange}
          availableTools={getToolsByCategory(selectedStep.stepType)}
        />
      );
    }
    return (
      <WorkflowSettingsPanel
        template={template}
        onChange={handleSettingsChange}
        toolDisplayNames={toolDisplayNames}
      />
    );
  }, [
    selectedStepId,
    selectedStep,
    template,
    template.trigger,
    handleTriggerChange,
    handleStepChange,
    handleSettingsChange,
    getToolsByCategory,
    toolDisplayNames,
  ]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <PageContainer className="flex h-[calc(100vh-4rem)] flex-col max-w-full">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/workflows" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Workflows
            </Link>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Input
              value={template.name ?? ""}
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  template: { ...prev.template, name: e.target.value },
                  isDirty: true,
                }));
              }}
              onBlur={() => setDirty()}
              placeholder="Workflow name"
              className={cn(
                "h-8 max-w-[240px] font-medium border-0 bg-transparent px-1 focus-visible:ring-1",
                validationErrors.name && "border-b border-destructive"
              )}
            />
          </div>
          {isDirty && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              <Loader2 className="h-3 w-3 animate-spin" />
              Unsaved changes
            </span>
          )}
          {selectedStepId !== null && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs shrink-0"
              onClick={selectNothing}
            >
              Workflow settings
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>
          <Button size="sm" onClick={handleCreate}>
            Create Workflow
          </Button>
        </div>
      </header>

      {hasValidationErrors && (
        <div className="shrink-0 border-b border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {Object.entries(validationErrors).map(([key, messages]) => (
            <div key={key}>
              {messages.map((m, i) => (
                <span key={i}>{m} </span>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row border-b border-border">
        <div
          className={cn(
            "flex flex-col border-r border-border bg-muted/30 overflow-auto",
            "w-full lg:w-[40%] lg:min-w-[280px] lg:max-w-[400px]"
          )}
        >
          <FlowOutline
            trigger={template.trigger}
            steps={steps}
            selectedStepId={selectedStepId}
            onSelectTrigger={selectTrigger}
            onSelectStep={selectStep}
            onAddStep={addStep}
            onReorderStep={reorderSteps}
            onRemoveStep={removeStep}
          />
        </div>

        <div
          className="flex-1 min-w-0 overflow-auto p-4 bg-background"
          onClick={selectedStepId !== null ? selectNothing : undefined}
          role={selectedStepId !== null ? "button" : undefined}
          tabIndex={selectedStepId !== null ? 0 : undefined}
          onKeyDown={
            selectedStepId !== null
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectNothing();
                  }
                }
              : undefined
          }
        >
          <div
            key={selectedStepId ?? "settings"}
            className="animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {rightPanelContent}
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {steps.length} steps · ~{totalMinutes} min total · Category: {categoryLabel}
      </footer>
    </PageContainer>
  );
}
