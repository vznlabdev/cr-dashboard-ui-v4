"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Zap,
  Calendar,
  CheckCircle,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WorkflowTrigger,
  WorkflowTriggerType,
} from "@/types/workflow-builder";

/** Extended trigger config for UI-only settings (stored in config for persistence). */
type TriggerConfigExtended = WorkflowTrigger["config"] & {
  notifyCreatorOnStart?: boolean;
  requireActiveInsurance?: boolean;
  autoAssignTo?: string;
  scheduleFrequency?: "daily" | "weekly" | "monthly";
  scheduleTime?: string;
};

const TRIGGER_OPTIONS: {
  type: WorkflowTriggerType;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    type: "manual",
    icon: Clock,
    title: "Manual Start",
    description: "Creator starts from task",
  },
  {
    type: "on_task_created",
    icon: Zap,
    title: "On Task Created",
    description: "Auto-start when task is assigned this workflow",
  },
  {
    type: "on_schedule",
    icon: Calendar,
    title: "On Schedule",
    description: "Run on a recurring schedule",
  },
  {
    type: "on_brief_approved",
    icon: CheckCircle,
    title: "On Brief Approved",
    description: "Start when creative brief is approved",
  },
  {
    type: "on_asset_upload",
    icon: Upload,
    title: "On Asset Upload",
    description: "Trigger when new asset is added to project",
  },
];

const AUTO_ASSIGN_OPTIONS = [
  { value: "creator", label: "Task creator" },
  { value: "project_manager", label: "Project manager" },
  { value: "specific_role", label: "Specific role" },
];

interface TriggerConfigPanelProps {
  trigger: WorkflowTrigger;
  onChange: (trigger: WorkflowTrigger) => void;
}

function getExtendedConfig(trigger: WorkflowTrigger): TriggerConfigExtended {
  const c = trigger.config ?? {};
  return {
    ...c,
    notifyCreatorOnStart: (c as TriggerConfigExtended).notifyCreatorOnStart ?? true,
    requireActiveInsurance: (c as TriggerConfigExtended).requireActiveInsurance ?? false,
    autoAssignTo: (c as TriggerConfigExtended).autoAssignTo ?? "creator",
    scheduleFrequency: (c as TriggerConfigExtended).scheduleFrequency ?? "daily",
    scheduleTime: (c as TriggerConfigExtended).scheduleTime ?? "09:00",
  };
}

export function TriggerConfigPanel({ trigger, onChange }: TriggerConfigPanelProps) {
  const config = getExtendedConfig(trigger);
  const isSchedule = trigger.type === "on_schedule";
  const isAssetUpload = trigger.type === "on_asset_upload";

  const handleSelectType = useCallback(
    (type: WorkflowTriggerType) => {
      onChange({
        ...trigger,
        type,
        config:
          type === "on_schedule"
            ? { ...trigger.config, schedule: "0 9 * * *" }
            : type === "on_asset_upload"
              ? { ...trigger.config, projectFilter: "" }
              : trigger.config,
      });
    },
    [trigger, onChange]
  );

  const updateConfig = useCallback(
    (updates: Partial<TriggerConfigExtended>) => {
      onChange({
        ...trigger,
        config: { ...trigger.config, ...updates },
      });
    },
    [trigger, onChange]
  );

  const buildCron = useCallback(
    (frequency: "daily" | "weekly" | "monthly", time: string) => {
      const [h, m] = time.split(":").map((x) => parseInt(x, 10) || 0);
      const hour = Math.min(23, Math.max(0, h));
      const min = Math.min(59, Math.max(0, m));
      return frequency === "daily"
        ? `${min} ${hour} * * *`
        : frequency === "weekly"
          ? `${min} ${hour} * * 1`
          : `${min} ${hour} 1 * *`;
    },
    []
  );

  const handleScheduleFrequency = useCallback(
    (value: string) => {
      const frequency = value as "daily" | "weekly" | "monthly";
      const time = config.scheduleTime ?? "09:00";
      const cron = buildCron(frequency, time);
      updateConfig({ scheduleFrequency: frequency, schedule: cron });
    },
    [config.scheduleTime, updateConfig, buildCron]
  );

  const handleScheduleTime = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const scheduleTime = e.target.value;
      const freq = (config.scheduleFrequency ?? "daily") as "daily" | "weekly" | "monthly";
      const cron = buildCron(freq, scheduleTime);
      updateConfig({ scheduleTime, schedule: cron });
    },
    [config.scheduleFrequency, updateConfig, buildCron]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Choose how to start your workflow</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          This event or schedule will launch your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRIGGER_OPTIONS.map(({ type, icon: Icon, title, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSelectType(type)}
            className={cn(
              "flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
              "border-border bg-card hover:bg-muted/50",
              trigger.type === type &&
                "ring-2 ring-blue-500 ring-offset-2 border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/20 dark:ring-offset-background"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                trigger.type === type
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {isSchedule && (
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Frequency</Label>
                <Select
                  value={config.scheduleFrequency ?? "daily"}
                  onValueChange={handleScheduleFrequency}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Time</Label>
                <Input
                  type="time"
                  value={config.scheduleTime ?? "09:00"}
                  onChange={handleScheduleTime}
                  className="h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAssetUpload && (
        <Card className="border border-border">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Label className="text-xs">Project</Label>
              <Select
                value={trigger.config?.projectFilter ?? ""}
                onValueChange={(value) =>
                  updateConfig({ projectFilter: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any project</SelectItem>
                  <SelectItem value="project-1">Summer Campaign 2024</SelectItem>
                  <SelectItem value="project-2">Product Launch</SelectItem>
                  <SelectItem value="project-3">Brand Refresh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Trigger Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-creator" className="text-sm font-normal">
              Notify creator on start
            </Label>
            <Switch
              id="notify-creator"
              checked={config.notifyCreatorOnStart ?? true}
              onCheckedChange={(checked) =>
                updateConfig({ notifyCreatorOnStart: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="require-insurance" className="text-sm font-normal">
              Require active insurance policy
            </Label>
            <Switch
              id="require-insurance"
              checked={config.requireActiveInsurance ?? false}
              onCheckedChange={(checked) =>
                updateConfig({ requireActiveInsurance: checked })
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Auto-assign to</Label>
            <Select
              value={config.autoAssignTo ?? "creator"}
              onValueChange={(value) => updateConfig({ autoAssignTo: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {AUTO_ASSIGN_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
